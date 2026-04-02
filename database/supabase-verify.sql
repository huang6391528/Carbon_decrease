-- ================================================
-- 数据库完整性自检脚本
-- 在 Supabase SQL Editor 新建查询，粘贴后 Run
-- ================================================

-- 1. 检查所有表是否存在
SELECT '表检查' AS 类别, 'profiles' AS 对象, (to_regclass('public.profiles') IS NOT NULL) AS 存在
UNION ALL SELECT '表检查', 'carbon_records',    (to_regclass('public.carbon_records')    IS NOT NULL)
UNION ALL SELECT '表检查', 'energy_balls',      (to_regclass('public.energy_balls')      IS NOT NULL)
UNION ALL SELECT '表检查', 'checkin_tasks',     (to_regclass('public.checkin_tasks')     IS NOT NULL)
UNION ALL SELECT '表检查', 'checkin_records',   (to_regclass('public.checkin_records')   IS NOT NULL)
UNION ALL SELECT '表检查', 'products',          (to_regclass('public.products')          IS NOT NULL)
UNION ALL SELECT '表检查', 'orders',            (to_regclass('public.orders')            IS NOT NULL)
UNION ALL SELECT '表检查', 'order_items',       (to_regclass('public.order_items')       IS NOT NULL)
UNION ALL SELECT '表检查', 'posts',             (to_regclass('public.posts')             IS NOT NULL)
UNION ALL SELECT '表检查', 'articles',          (to_regclass('public.articles')          IS NOT NULL)
UNION ALL SELECT '表检查', 'badges',            (to_regclass('public.badges')            IS NOT NULL)
UNION ALL SELECT '表检查', 'user_badges',       (to_regclass('public.user_badges')       IS NOT NULL)
UNION ALL SELECT '表检查', 'competitions',      (to_regclass('public.competitions')      IS NOT NULL)
UNION ALL SELECT '表检查', 'competition_participants', (to_regclass('public.competition_participants') IS NOT NULL);

-- 2. 检查关键触发器是否存在
SELECT '触发器检查' AS 类别, 'on_auth_user_created' AS 对象,          (to_regclass('public.on_auth_user_created')          IS NOT NULL) AS 存在
UNION ALL SELECT '触发器检查', 'profiles_updated_at',                 (to_regclass('public.profiles_updated_at')            IS NOT NULL)
UNION ALL SELECT '触发器检查', 'orders_updated_at',                   (to_regclass('public.orders_updated_at')              IS NOT NULL)
UNION ALL SELECT '触发器检查', 'trg_energy_balls_set_collected_on_utc',(to_regclass('public.trg_energy_balls_set_collected_on_utc') IS NOT NULL);

-- 3. 检查视图是否存在
SELECT '视图检查' AS 类别, 'leaderboard' AS 对象,   (to_regclass('public.leaderboard')  IS NOT NULL) AS 存在
UNION ALL SELECT '视图检查', 'weekly_report',       (to_regclass('public.weekly_report') IS NOT NULL);

-- 4. 检查 products 表里有没有初始商品（验证 INSERT 是否成功）
SELECT '初始化数据' AS 类别, '商品数量' AS 对象, COUNT(*) AS 数量 FROM public.products;

-- 5. 检查 energy_balls 是否有新列 collected_on_utc（验证脚本版本）
SELECT '字段检查' AS 类别, 'energy_balls.collected_on_utc', (EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='energy_balls' AND column_name='collected_on_utc'
)) AS 存在;
