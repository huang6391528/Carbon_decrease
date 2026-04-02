-- ================================================
-- 碳路者·青碳行 - Supabase 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本
-- ================================================

-- 1. 用户表
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nickname TEXT DEFAULT '新用户',
    avatar TEXT DEFAULT 'https://modao.cc/agent-py/media/generated_images/2026-03-29/dcd31a5496fe4151ba6851123f2f3cfa.jpg',
    school TEXT,
    department TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    carbon_score INTEGER DEFAULT 0,
    total_carbon DECIMAL(10,2) DEFAULT 0,
    trees_planted INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    level_name TEXT DEFAULT '碳路新手',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 碳积分记录表
CREATE TABLE IF NOT EXISTS public.carbon_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('步行', '地铁', '公交', '骑行', '回收', '垃圾分类', '光盘行动', '旧物捐赠', '其他')),
    amount INTEGER NOT NULL,
    description TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 能量球收集记录
-- 注意：不能在唯一索引里用 (collected_at::date)，因 timestamptz→date 依赖时区，非 IMMUTABLE，会报 42P17。
CREATE TABLE IF NOT EXISTS public.energy_balls (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    ball_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    collected_on_utc DATE NOT NULL
);

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

-- 4. 打卡任务表
CREATE TABLE IF NOT EXISTS public.checkin_tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    icon_bg TEXT,
    reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. 用户打卡记录
CREATE TABLE IF NOT EXISTS public.checkin_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    task_id INTEGER REFERENCES public.checkin_tasks(id) NOT NULL,
    checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_checkin_daily
    ON public.checkin_records (user_id, task_id, checkin_date);

-- 6. 商品表
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    original_price INTEGER,
    stock INTEGER,
    category TEXT,
    image TEXT,
    sold_count INTEGER DEFAULT 0,
    is_hot BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 订单表
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    total_price INTEGER NOT NULL,
    status TEXT DEFAULT '待领取' CHECK (status IN ('待领取', '已领取', '已完成', '已取消')),
    receiver_name TEXT,
    receiver_phone TEXT,
    receiver_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 订单明细
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1
);

-- 9. 动态墙（帖子）
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    carbon_amount INTEGER DEFAULT 0,
    images TEXT[],  -- 存储图片URL数组
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 资讯文章表
CREATE TABLE IF NOT EXISTS public.articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    image TEXT,
    views INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. 成就/勋章表
CREATE TABLE IF NOT EXISTS public.badges (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    requirement TEXT
);

-- 12. 用户成就
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    badge_id INTEGER REFERENCES public.badges(id) NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- 13. 校园竞赛表
CREATE TABLE IF NOT EXISTS public.competitions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    reward TEXT,
    status TEXT DEFAULT '进行中' CHECK (status IN ('进行中', '已结束')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. 竞赛参赛学校
CREATE TABLE IF NOT EXISTS public.competition_participants (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER REFERENCES public.competitions(id) ON DELETE CASCADE,
    school_name TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0
);

-- ================================================
-- 初始化数据
-- ================================================

-- 插入打卡任务
INSERT INTO public.checkin_tasks (title, description, icon, icon_bg, reward) VALUES
    ('减免一次外卖餐具', '上传订单截图即可获得', 'ph-bowl-food', 'orange', 15),
    ('校园巴士出行', '已自动同步', 'ph-bus', 'blue', 8),
    ('旧物循环捐赠', '预约校园菜鸟驿站回收', 'ph-package', 'purple', 20),
    ('光盘行动打卡', '食堂餐后拍照上传', 'ph-drop', 'yellow', 10),
    ('步行打卡', '每日步行超过5000步', 'ph-person-simple-walk', 'green', 12),
    ('垃圾分类', '完成一次正确分类', 'ph-recycle', 'teal', 5),
    ('绿色骑行', '骑行超过2公里', 'ph-bicycle', 'emerald', 15),
    ('节能打卡', '关闭不必要的电器', 'ph-lightbulb', 'amber', 5)
ON CONFLICT DO NOTHING;

-- 插入商品
INSERT INTO public.products (name, price, original_price, stock, category, image, sold_count, is_hot) VALUES
    ('可降解竹炭牙刷 4支装', 450, 600, NULL, '环保好物', 'https://modao.cc/agent-py/media/generated_images/2026-03-29/37efc3dd161e40efaa15aad56c725951.jpg', 1200, TRUE),
    ('校园食堂无门槛3元券', 300, 500, NULL, '餐饮券', 'https://modao.cc/agent-py/media/generated_images/2026-03-29/37efc3dd161e40efaa15aad56c725951.jpg', 4800, TRUE),
    ('"青碳行"限定联名环保杯套', 120, 200, 12, '限定礼品', 'https://modao.cc/agent-py/media/generated_images/2026-03-29/37efc3dd161e40efaa15aad56c725951.jpg', 0, FALSE),
    ('校园单车包月免费卡', 1500, 2000, NULL, '出行', 'https://modao.cc/agent-py/media/generated_images/2026-03-29/37efc3dd161e40efaa15aad56c725951.jpg', 0, FALSE),
    ('瑞幸咖啡5元抵扣券', 200, 500, NULL, '餐饮券', 'https://modao.cc/agent-py/media/generated_images/2026-03-29/37efc3dd161e40efaa15aad56c725951.jpg', 0, FALSE),
    ('环保帆布手提袋', 800, 1200, NULL, '环保好物', 'https://modao.cc/agent-py/media/generated_images/2026-03-29/37efc3dd161e40efaa15aad56c725951.jpg', 0, FALSE)
ON CONFLICT DO NOTHING;

-- 插入资讯文章
INSERT INTO public.articles (title, content, category, image, views) VALUES
    ('为什么少喝一瓶瓶装水能减少 80g 碳排放？',
     '瓶装水的生产和运输过程中会产生大量碳排放。每生产1升瓶装水，平均产生约82.3克的二氧化碳。减少一瓶瓶装水，一年就能减少约30kg的碳足迹。',
     '科普 · 环境', 'https://modao.cc/agent-py/media/generated_images/2026-03-29/0aa1ef5670a94f649ed536b5c1596e70.jpg', 1200),
    ('宿舍节能挑战：每月省电 20% 的实操指南',
     '宿舍用电量往往被忽视，但其实通过简单的习惯改变就能节省大量电费。1. 离开时关闭所有电器和灯 2. 空调温度设置在26度以上 3. 使用LED灯泡 4. 拔掉待机电源。',
     '生活 · 节能', 'https://modao.cc/agent-py/media/generated_images/2026-03-29/0aa1ef5670a94f649ed536b5c1596e70.jpg', 856)
ON CONFLICT DO NOTHING;

-- 插入成就
INSERT INTO public.badges (name, icon, description, requirement) VALUES
    ('暴走达人', 'ph-sneaker-move', '单日步行超过10000步', 'steps >= 10000'),
    ('骑行专家', 'ph-bicycle', '累计骑行超过100公里', 'total_km >= 100'),
    ('环保萌芽', 'ph-plant', '完成首个低碳任务', 'tasks >= 1'),
    ('早起减碳', 'ph-sun-dim', '连续7天早起打卡', 'consecutive_days >= 7'),
    ('光盘达人', 'ph-bowl-food', '累计光盘打卡10次', 'checkin_count >= 10'),
    ('植树先锋', 'ph-tree', '累计种树3棵', 'trees >= 3')
ON CONFLICT DO NOTHING;

-- 插入竞赛
INSERT INTO public.competitions (name, description, start_date, end_date, reward, status) VALUES
    ('2026 校园减碳PK赛', '清华 VS 北大', '2026-03-01', '2026-03-31', '获胜学校可获得 10000 碳积分奖励', '进行中')
ON CONFLICT DO NOTHING;

INSERT INTO public.competition_participants (competition_id, school_name, score, progress) VALUES
    (1, '清华', 6500, 65),
    (1, '北大', 6200, 62)
ON CONFLICT DO NOTHING;

-- ================================================
-- Row Level Security (数据安全策略)
-- ================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_balls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- profiles: 用户只能读写自己的数据
CREATE POLICY "Users can view all profiles for leaderboard" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- carbon_records: 用户只能操作自己的记录
CREATE POLICY "Users can read own carbon records" ON public.carbon_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own carbon records" ON public.carbon_records FOR INSERT WITH CHECK (auth.uid() = user_id);

-- energy_balls: 用户只能操作自己的能量球
CREATE POLICY "Users can read own energy balls" ON public.energy_balls FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own energy balls" ON public.energy_balls FOR INSERT WITH CHECK (auth.uid() = user_id);

-- checkin_records: 用户只能操作自己的打卡记录
CREATE POLICY "Users can read own checkin records" ON public.checkin_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkin records" ON public.checkin_records FOR INSERT WITH CHECK (auth.uid() = user_id);

-- orders: 用户只能操作自己的订单
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- posts: 所有人可见，用户只能操作自己的
CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- user_badges: 用户只能操作自己的成就
CREATE POLICY "Users can read own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================================
-- 自动触发器
-- ================================================

-- 自动创建 profiles（用户注册后）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nickname)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nickname', '新用户'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 更新时间戳
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ================================================
-- 便捷视图
-- ================================================

-- 排行榜视图
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
    id,
    nickname,
    avatar,
    school,
    carbon_score,
    total_carbon,
    trees_planted,
    rank() OVER (ORDER BY carbon_score DESC) as rank
FROM public.profiles
WHERE is_verified = TRUE
ORDER BY carbon_score DESC;

-- 用户周报视图（不在视图里用 NOW() 过滤，查询时由应用加 WHERE；避免部分环境下与规划器/索引相关的问题）
CREATE OR REPLACE VIEW public.weekly_report AS
SELECT
    user_id,
    date_trunc('week', recorded_at) AS week_start,
    SUM(amount) AS weekly_carbon,
    COUNT(*) AS record_count
FROM public.carbon_records
GROUP BY user_id, date_trunc('week', recorded_at);
