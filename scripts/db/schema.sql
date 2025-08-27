-- AI-Day 数据库表结构

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表（由 Supabase Auth 自动管理）
-- 这里只创建用户配置表
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 作品表
CREATE TABLE IF NOT EXISTS submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    vote_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 投票表
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, submission_id) -- 防止重复投票
);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_submission_id ON votes(submission_id);

-- 创建触发器自动更新作品票数
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE submissions 
        SET vote_count = vote_count + 1 
        WHERE id = NEW.submission_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE submissions 
        SET vote_count = vote_count - 1 
        WHERE id = OLD.submission_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_vote_count ON votes;
CREATE TRIGGER trigger_update_vote_count
    AFTER INSERT OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_vote_count();

-- 创建 RLS 策略（行级安全）
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- 用户配置表策略
CREATE POLICY "用户可以查看自己的配置" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的配置" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 作品表策略
CREATE POLICY "所有人都可以查看作品" ON submissions
    FOR SELECT USING (true);

CREATE POLICY "登录用户可以创建作品" ON submissions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 允许触发器更新票数（不需要用户权限检查）
CREATE POLICY "允许触发器更新票数" ON submissions
    FOR UPDATE USING (true);

-- 投票表策略
CREATE POLICY "用户可以查看自己的投票" ON votes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "登录用户可以创建投票" ON votes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 创建函数获取用户剩余投票数
CREATE OR REPLACE FUNCTION get_user_remaining_votes(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    used_votes INTEGER;
    total_votes INTEGER := 3;
BEGIN
    SELECT COUNT(*) INTO used_votes
    FROM votes
    WHERE user_id = user_uuid;
    
    RETURN GREATEST(0, total_votes - used_votes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数检查用户是否可以投票
CREATE OR REPLACE FUNCTION can_user_vote(user_uuid UUID, submission_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    remaining_votes INTEGER;
    already_voted BOOLEAN;
BEGIN
    -- 检查剩余投票数
    SELECT get_user_remaining_votes(user_uuid) INTO remaining_votes;
    
    -- 检查是否已经投票
    SELECT EXISTS(
        SELECT 1 FROM votes 
        WHERE user_id = user_uuid AND submission_id = submission_uuid
    ) INTO already_voted;
    
    RETURN remaining_votes > 0 AND NOT already_voted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
