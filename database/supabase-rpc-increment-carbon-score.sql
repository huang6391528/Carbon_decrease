-- ================================================
-- 原子积分更新 RPC 函数
-- 用于并发安全地增加 / 扣减用户碳积分
-- ================================================

CREATE OR REPLACE FUNCTION public.increment_carbon_score(delta INTEGER, user_uuid UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.profiles
    SET carbon_score = carbon_score + delta
    WHERE id = user_uuid;
END;
$$;
