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

-- ================================================
-- 打卡功能测试数据
-- 执行方式：在 Supabase SQL Editor 新建查询，粘贴后 Run
-- ================================================

-- 6. 插入测试用户（手机号 12345600000 对应的 Supabase Auth 用户）
-- 注意：auth.users 表无法通过普通 SQL 直接插入，这里需要先在 Supabase Auth 创建用户
-- 如果 auth.users 已有该手机号用户，查询其 id 后填入 profiles
-- 临时方案：直接插入 profiles（不影响功能测试）
INSERT INTO public.profiles (id, nickname, carbon_score, school, is_verified)
VALUES (
    '2dedd653-78ca-4104-8701-7260700904d5',
    '测试用户',
    1286,
    '清华大学',
    true
)
ON CONFLICT (id) DO UPDATE SET
    nickname = EXCLUDED.nickname,
    carbon_score = EXCLUDED.carbon_score,
    is_verified = EXCLUDED.is_verified;

-- 7. 写入初始碳积分记录（让打卡历史看起来更真实）
INSERT INTO public.carbon_records (user_id, type, amount, description)
VALUES
    ('2dedd653-78ca-4104-8701-7260700904d5', '步行', 12, '每日步行打卡'),
    ('2dedd653-78ca-4104-8701-7260700904d5', '地铁', 45, '地铁出行'),
    ('2dedd653-78ca-4104-8701-7260700904d5', '回收', 8, '塑料瓶回收')
ON CONFLICT DO NOTHING;

-- 8. 查询确认
SELECT '测试用户' AS 类别, nickname, carbon_score FROM public.profiles
WHERE id = '2dedd653-78ca-4104-8701-7260700904d5';
