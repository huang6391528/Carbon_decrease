# 碳路者·青碳行 - Supabase 后端接入指南

## 一、技术选型说明

选择 **Supabase** 作为后端方案的原因：

| 维度 | 说明 |
|------|------|
| 免费额度 | 每月 500MB 数据库、10GB 存储、5万月活用户，学生项目完全够用 |
| 部署方式 | 云端托管，无需服务器，无需自己维护 |
| 接入难度 | 提供 JS SDK，前端改少量代码即可接入 |
| 数据安全 | Row Level Security（行级安全策略），用户只能读写自己的数据 |
| 扩展性 | 支持实时订阅、云函数，未来功能可平滑扩展 |

---

## 二、快速开始（10 分钟）

### 第一步：创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)，用 GitHub 账号登录
2. 点击 **New Project**，填写：
   - Organization：选择个人或创建新组织
   - Name：`carbon-platform`（项目名称）
   - Database Password：自动生成，保存好
   - Region：选择 **亚太东北**（日本/新加坡），国内访问较快
3. 等待约 2 分钟，项目创建完成

### 第二步：获取连接信息

进入项目后，找到 **Settings > API**，复制以下信息：

```
Project URL: https://xxxxxxxxxxxx.supabase.co
anon / public key: eyJhbGc...（以 eyJ 开头的长字符串）
```

### 第三步：执行数据库脚本

1. 进入 **SQL Editor**
2. 新建查询，粘贴 `database/supabase-schema.sql` 全部内容
3. 点击 **Run**，等待执行完成（约 10 秒）

### 第四步：安装前端 SDK

在 `web-demo/index.html` 的 `<head>` 中添加：

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 第五步：配置连接

在 `web-demo/js/app.js` 开头添加：

```javascript
const supabaseUrl = 'https://xxxxxxxxxxxx.supabase.co';
const supabaseKey = 'eyJhbGc...';  // 替换为你的 anon key

// 初始化 Supabase 客户端
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
```

---

## 三、数据表结构概览

| 表名 | 用途 | 重要字段 |
|------|------|----------|
| `profiles` | 用户信息 | carbon_score（碳积分）, school, is_verified |
| `carbon_records` | 碳积分流水 | type（步行/地铁/回收...）, amount, recorded_at |
| `energy_balls` | 能量球收集记录 | ball_type, amount, UNIQUE(用户+类型+日期) |
| `checkin_tasks` | 打卡任务（系统配置） | title, icon, reward |
| `checkin_records` | 用户打卡记录 | task_id, checkin_date, UNIQUE(用户+任务+日期) |
| `products` | 商城商品 | name, price, stock, category |
| `orders` | 订单 | user_id, total_price, status |
| `order_items` | 订单明细 | product_id, quantity |
| `posts` | 动态墙 | user_id, content, carbon_amount, images[] |
| `articles` | 资讯文章 | title, content, views |
| `badges` | 成就配置 | name, icon, requirement |
| `user_badges` | 用户成就 | badge_id, unlocked_at |
| `competitions` | 校园竞赛 | name, status, reward |
| `competition_participants` | 竞赛参赛学校 | school_name, score, progress |
| `leaderboard`（视图） | 排行榜 | rank() OVER carbon_score DESC |

---

## 四、前端改造说明

### 改造原则

- **保留现有 UI** — 所有页面样式不变
- **替换 localStorage** 为 Supabase API 调用
- **渐进式改造** — 可以先只改登录/注册，其他页面逐步迁移

### 核心改动示例

#### 用户注册/登录（login.html）

```javascript
// 替换原来的假登录逻辑
async function loginWithPhone(phone, code) {
    // Supabase 支持短信验证码登录
    const { data, error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: { code: code }
    });
    if (error) throw error;
    return data;
}
```

#### 保存碳积分（index.html 能量球收集）

```javascript
// 原来：AppState.carbonScore += amount; saveState(AppState);
const { data, error } = await supabase
    .from('energy_balls')
    .insert({ user_id: user.id, ball_type: type, amount: amount });

// 更新用户积分
await supabase
    .from('profiles')
    .update({ carbon_score: AppState.carbonScore })
    .eq('id', user.id);
```

#### 打卡（checkin.html）

```javascript
// 原来：AppState.completedTasks.push(taskId); saveState(AppState);
const { error } = await supabase
    .from('checkin_records')
    .insert({ user_id: user.id, task_id: taskId, checkin_date: new Date() });
```

---

## 五、API 调用速查

### 查询

```javascript
// 获取用户信息
const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();

// 获取排行榜（Top 20）
const { data } = await supabase.from('leaderboard').select('*').limit(20);

// 获取商品列表
const { data } = await supabase.from('products').select('*').eq('is_active', true);

// 获取用户订单
const { data } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', userId);

// 获取动态墙
const { data } = await supabase.from('posts').select('*, profiles(nickname, avatar)').order('created_at', { ascending: false });
```

### 插入

```javascript
// 打卡
await supabase.from('checkin_records').insert({ user_id, task_id, checkin_date: new Date() });

// 创建订单
const { data } = await supabase.from('orders').insert({ user_id, total_price, status: '待领取' }).select().single();

// 发布动态
await supabase.from('posts').insert({ user_id, content, carbon_amount });
```

### 更新

```javascript
// 扣除积分 + 创建订单（事务）
const { error } = await supabase.rpc('exchange_product', {
    p_user_id: userId,
    p_product_id: productId,
    p_price: price
});
```

---

## 六、进阶：存储文件（头像/图片）

Supabase Storage 用于存储用户上传的头像、动态图片等：

```javascript
// 上传头像
const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${userId}/avatar.jpg`, fileBlob);

// 获取公开URL
const { data } = supabase.storage.from('avatars').getPublicUrl(`${userId}/avatar.jpg`);
```

需要创建 Storage Bucket：`avatars`（公开）、`post-images`（公开）

---

## 七、部署

### 前端部署（GitHub Pages，免费）

1. 将 `web-demo` 文件夹推送到 GitHub 仓库
2. 在仓库 Settings > Pages，Source 选 `main` 分支 `/docs`（或直接选根目录）
3. 等待 2 分钟，即可通过 `https://你的用户名.github.io/仓库名/` 访问

### 环境变量配置

在 `web-demo` 根目录创建 `.env` 文件（不上传到 GitHub）：

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 八、常见问题

**Q: 国内访问 Supabase 速度如何？**
A: 选择日本/新加坡节点，延迟约 100-300ms，可以接受。如果要求更高，可以考虑腾讯云或阿里云的 Supabase 自托管方案。

**Q: 如果课设不需要真实用户系统，只想演示怎么办？**
A: 可以先只接 Supabase 匿名登录（无需注册），数据存在本地 localStorage，数据库只用来存储排行榜等共享数据。

**Q: 数据库免费额度用完了怎么办？**
A: 教育邮箱可以申请 Supabase Pro 赞助（免费），月费 $25 的功能全免费。

---

## 九、后续接入清单

- [ ] 创建 Supabase 项目
- [ ] 执行 `database/supabase-schema.sql`
- [ ] 开启手机号登录（Authentication > Providers > Phone）
- [ ] 安装前端 SDK
- [ ] 改造 `login.html` 接入真实验证码登录
- [ ] 改造 `app.js` 中的数据读写为 Supabase API
- [ ] 配置 Storage Bucket
- [ ] 部署到 GitHub Pages
