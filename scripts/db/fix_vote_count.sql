-- 修复投票票数更新问题的脚本
-- 在 Supabase SQL Editor 中运行

-- 1. 删除旧的触发器
DROP TRIGGER IF EXISTS trigger_update_vote_count ON votes;

-- 2. 删除旧的函数
DROP FUNCTION IF EXISTS update_vote_count();

-- 3. 重新创建触发器函数
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE submissions 
        SET vote_count = COALESCE(vote_count, 0) + 1,
            updated_at = NOW()
        WHERE id = NEW.submission_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE submissions 
        SET vote_count = GREATEST(COALESCE(vote_count, 0) - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.submission_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 重新创建触发器
CREATE TRIGGER trigger_update_vote_count
    AFTER INSERT OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_vote_count();

-- 5. 修复现有的票数数据（重新计算所有作品的票数）
UPDATE submissions s 
SET vote_count = COALESCE(vote_count, 0)
WHERE vote_count IS NULL;

-- 6. 重新计算所有作品的票数（基于 votes 表）
UPDATE submissions s 
SET vote_count = (
    SELECT COALESCE(COUNT(v.id), 0)
    FROM votes v 
    WHERE v.submission_id = s.id
),
updated_at = NOW();

-- 7. 验证修复结果
SELECT 
    s.id,
    s.title,
    s.vote_count as stored_vote_count,
    COUNT(v.id) as calculated_vote_count,
    CASE 
        WHEN s.vote_count = COUNT(v.id) THEN '✅ 已修复'
        ELSE '❌ 仍有问题'
    END as status
FROM submissions s
LEFT JOIN votes v ON s.id = v.submission_id
GROUP BY s.id, s.title, s.vote_count
ORDER BY s.created_at DESC;

-- 8. 检查触发器状态
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_vote_count';
