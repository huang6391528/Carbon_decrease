-- ================================================
-- 打卡加分 RPC 函数
-- 调用方式：
--   SELECT public.checkin_and_add_score(
--     task_id INTEGER,      -- 打卡任务ID
--     score_delta INTEGER,   -- 增加的碳积分
--     task_title TEXT       -- 任务名称（用于记录描述）
--   );
--
-- 效果：
--   1. profiles.carbon_score += score_delta
--   2. carbon_records 插入一条记录
--   3. checkin_records 插入一条记录（同一天同一任务不会重复）
-- ================================================

CREATE OR REPLACE FUNCTION public.checkin_and_add_score(
    task_id INTEGER,
    score_delta INTEGER,
    task_title TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    test_user_id UUID := '2dedd653-78ca-4104-8701-7260700904d5';
BEGIN
    -- 1. 增加用户碳积分
    UPDATE public.profiles
    SET carbon_score = carbon_score + score_delta
    WHERE id = test_user_id;

    -- 2. 写入碳积分记录
    INSERT INTO public.carbon_records (user_id, type, amount, description)
    VALUES (test_user_id, '其他', score_delta, task_title);

    -- 3. 写入打卡记录（ON CONFLICT 保证同一天同一任务不重复）
    INSERT INTO public.checkin_records (user_id, task_id, checkin_date)
    VALUES (test_user_id, task_id, CURRENT_DATE)
    ON CONFLICT (user_id, task_id, checkin_date) DO NOTHING;
END;
$$;
