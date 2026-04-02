-- ================================================
-- 【重要】本文件只给「已经建过旧版 energy_balls 表」的数据库用。
--
-- 若报错 relation "energy_balls" does not exist：
--   → 说明表还没建，不要执行本文件。
--   → 请打开 supabase-schema.sql，全选后一次性 Run（从头建库）。
--
-- 若你之前建表成功但索引失败、或表里已有数据：
--   → 再执行本补丁。
-- ================================================

DO $$
BEGIN
    IF to_regclass('public.energy_balls') IS NULL THEN
        RAISE EXCEPTION 'energy_balls 表不存在：请跳过本补丁，在 SQL Editor 中执行 supabase-schema.sql 全文。';
    END IF;
END $$;

DROP INDEX IF EXISTS public.idx_energy_balls_daily;

ALTER TABLE public.energy_balls
    ADD COLUMN IF NOT EXISTS collected_on_utc DATE;

UPDATE public.energy_balls
SET collected_on_utc = (collected_at AT TIME ZONE 'UTC')::date
WHERE collected_on_utc IS NULL;

ALTER TABLE public.energy_balls
    ALTER COLUMN collected_on_utc SET NOT NULL;

CREATE OR REPLACE FUNCTION public.energy_balls_set_collected_on_utc()
RETURNS TRIGGER AS $$
BEGIN
    NEW.collected_on_utc := (NEW.collected_at AT TIME ZONE 'UTC')::date;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_energy_balls_set_collected_on_utc ON public.energy_balls;
CREATE TRIGGER trg_energy_balls_set_collected_on_utc
    BEFORE INSERT OR UPDATE OF collected_at ON public.energy_balls
    FOR EACH ROW EXECUTE FUNCTION public.energy_balls_set_collected_on_utc();

CREATE UNIQUE INDEX IF NOT EXISTS idx_energy_balls_daily
    ON public.energy_balls (user_id, ball_type, collected_on_utc);
