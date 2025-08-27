-- 诊断投票票数问题的脚本
-- 在 Supabase SQL Editor 中运行

-- 1. 检查 submissions 表的当前状态
SELECT 
    id,
    title,
    vote_count,
    created_at,
    updated_at
FROM submissions
ORDER BY created_at DESC;

-- 2. 检查 votes 表的当前状态
SELECT 
    v.id,
    v.user_id,
    v.submission_id,
    s.title as submission_title,
    v.created_at
FROM votes v
JOIN submissions s ON v.submission_id = s.id
ORDER BY v.created_at DESC;

-- 3. 手动计算每个作品的票数（验证触发器是否正确工作）
SELECT 
    s.id,
    s.title,
    s.vote_count as stored_vote_count,
    COUNT(v.id) as calculated_vote_count,
    CASE 
        WHEN s.vote_count = COUNT(v.id) THEN '✅ 正确'
        ELSE '❌ 不匹配'
    END as status
FROM submissions s
LEFT JOIN votes v ON s.id = v.submission_id
GROUP BY s.id, s.title, s.vote_count
ORDER BY s.created_at DESC;

-- 4. 检查触发器是否存在
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_vote_count';

-- 5. 检查触发器函数是否存在
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'update_vote_count';

-- 6. 检查 RLS 策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('submissions', 'votes');

-- 7. 手动测试触发器（如果需要）
-- 注意：这个操作会创建一个测试投票，测试完成后请删除
-- INSERT INTO votes (user_id, submission_id) 
-- SELECT auth.uid(), (SELECT id FROM submissions LIMIT 1)
-- WHERE EXISTS (SELECT 1 FROM submissions LIMIT 1);

-- 8. 检查是否有权限问题
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_name IN ('submissions', 'votes');
