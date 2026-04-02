/* ================================================
   碳路者·青碳行 - Web Demo 模拟数据层
   ================================================ */

const MockData = {

    // ---------- 用户信息 ----------
    user: {
        id: 'user_001',
        name: '小碳',
        nickname: '李华',
        avatar: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/dcd31a5496fe4151ba6851123f2f3cfa.jpg',
        level: 4,
        levelName: '低碳先锋',
        school: '同济大学',
        department: '环境工程学院',
        carbonScore: 1286,
        totalCarbon: 24.5,
        treesPlanted: 3,
        achievements: 12,
        isVerified: true,
        rank: 12,
        totalRank: 100
    },

    // ---------- 今日数据 ----------
    today: {
        date: '2026年3月29日',
        weather: '晴',
        steps: 8642,
        stepGoal: 10000,
        carbonScore: 65,
        totalCarbon: 1.28,
        checkinCount: 4,
        checkinGoal: 8
    },

    // ---------- 能量球数据 ----------
    energyBalls: [
        { id: 1, type: '步行', amount: 12, color: '#34d399', icon: 'ph-person-simple-walk', collected: false },
        { id: 2, type: '地铁', amount: 45, color: '#a3e635', icon: 'ph-train', collected: false },
        { id: 3, type: '回收', amount: 8, color: '#2dd4bf', icon: 'ph-recycle', collected: false }
    ],

    // ---------- 打卡任务 ----------
    checkinTasks: [
        {
            id: 1,
            title: '减免一次外卖餐具',
            desc: '上传订单截图即可获得',
            icon: 'ph-bowl-food',
            iconBg: 'orange',
            reward: 15,
            completed: false
        },
        {
            id: 2,
            title: '校园巴士出行',
            desc: '今日已自动同步 2 次',
            icon: 'ph-bus',
            iconBg: 'blue',
            reward: 0,
            completed: true
        },
        {
            id: 3,
            title: '旧物循环捐赠',
            desc: '预约校园菜鸟驿站回收',
            icon: 'ph-package',
            iconBg: 'purple',
            reward: 20,
            completed: false
        },
        {
            id: 4,
            title: '光盘行动打卡',
            desc: '食堂餐后拍照上传',
            icon: 'ph-drop',
            iconBg: 'yellow',
            reward: 10,
            completed: false
        }
    ],

    // ---------- 排行榜 ----------
    leaderboard: [
        { rank: 1, name: '陈向东', score: 3120, avatar: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/aebe9ded8268497fb80cf50f97790d42.jpg', tag: '步行 2.1w 步' },
        { rank: 2, name: '林悦', score: 2482, avatar: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/aebe9ded8268497fb80cf50f97790d42.jpg', tag: '骑行达人' },
        { rank: 3, name: '张子萱', score: 1965, avatar: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/aebe9ded8268497fb80cf50f97790d42.jpg', tag: '减碳标兵' },
        { rank: 4, name: '李浩', score: 1842, avatar: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/aebe9ded8268497fb80cf50f97790d42.jpg', tag: '步行 1.2w 步' },
        { rank: 5, name: '王语嫣', score: 1650, avatar: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/aebe9ded8268497fb80cf50f97790d42.jpg', tag: '公交出行 4 次' },
        { rank: 6, name: '赵明', score: 1420, avatar: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/aebe9ded8268497fb80cf50f97790d42.jpg', tag: '旧物捐赠达人' }
    ],

    // ---------- 动态墙 ----------
    feedPosts: [
        {
            id: 1,
            user: '陈向东',
            avatar: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/aebe9ded8268497fb80cf50f97790d42.jpg',
            content: '今日步行超过 10,000 步，为地球减少了 120g 碳排放！',
            carbonAmount: 120,
            time: '3分钟前',
            images: []
        },
        {
            id: 2,
            user: '林悦',
            avatar: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/aebe9ded8268497fb80cf50f97790d42.jpg',
            content: '完成了今日的光盘行动打卡，食堂的饭菜真的很好吃！',
            carbonAmount: 10,
            time: '10分钟前',
            images: ['https://modao.cc/agent-py/media/generated_images/2026-03-29/0aa1ef5670a94f649ed536b5c1596e70.jpg']
        }
    ],

    // ---------- 商城商品 ----------
    products: [
        { id: 1, name: '可降解竹炭牙刷 4支装 (绿色环保)', price: 450, originalPrice: 600, sold: 1200, image: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/37efc3dd161e40efaa15aad56c725951.jpg', stock: null, category: '环保好物', hot: true },
        { id: 2, name: '校园食堂无门槛3元券', price: 300, originalPrice: 500, sold: 4800, image: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/37efc3dd161e40efaa15aad56c725951.jpg', stock: null, category: '餐饮券', hot: true },
        { id: 3, name: '"青碳行"限定联名环保杯套', price: 120, originalPrice: 200, sold: 0, image: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/37efc3dd161e40efaa15aad56c725951.jpg', stock: 12, category: '限定礼品' },
        { id: 4, name: '校园单车包月免费卡', price: 1500, originalPrice: 2000, sold: 0, image: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/37efc3dd161e40efaa15aad56c725951.jpg', stock: null, category: '出行', limit: true },
        { id: 5, name: '瑞幸咖啡5元抵扣券', price: 200, originalPrice: 500, sold: 0, image: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/37efc3dd161e40efaa15aad56c725951.jpg', stock: null, category: '餐饮券' },
        { id: 6, name: '环保帆布手提袋', price: 800, originalPrice: 1200, sold: 0, image: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/37efc3dd161e40efaa15aad56c725951.jpg', stock: null, category: '环保好物' }
    ],

    // ---------- 减排趋势数据 ----------
    carbonTrend: {
        dates: ['3.23', '3.24', '3.25', '3.26', '3.27', '3.28', '3.29'],
        values: [120, 150, 80, 200, 160, 240, 180]
    },

    // ---------- 资讯文章 ----------
    articles: [
        {
            id: 1,
            title: '为什么少喝一瓶瓶装水能减少 80g 碳排放？',
            category: '科普 · 环境',
            views: 1200,
            image: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/0aa1ef5670a94f649ed536b5c1596e70.jpg',
            content: '瓶装水的生产和运输过程中会产生大量碳排放。每生产1升瓶装水，平均产生约82.3克的二氧化碳。而使用可重复使用的水杯，可以显著减少这类排放。减少一瓶瓶装水，一年就能减少约30kg的碳足迹。'
        },
        {
            id: 2,
            title: '宿舍节能挑战：每月省电 20% 的实操指南',
            category: '生活 · 节能',
            views: 856,
            image: 'https://modao.cc/agent-py/media/generated_images/2026-03-29/0aa1ef5670a94f649ed536b5c1596e70.jpg',
            content: '宿舍用电量往往被忽视，但其实通过简单的习惯改变就能节省大量电费。1. 离开时关闭所有电器和灯 2. 空调温度设置在26度以上 3. 使用LED灯泡 4. 拔掉待机电源。这些小改变每月可节省20%电费。'
        }
    ],

    // ---------- 校园竞赛 ----------
    campusCompetition: {
        name: '2026 校园减碳PK赛',
        status: '进行中',
        participants: ['清华', '北大'],
        progress: 65,
        description: '当前进度：清华 领先',
        startDate: '2026-03-01',
        endDate: '2026-03-31',
        reward: '获胜学校可获得 10000 碳积分奖励'
    },

    // ---------- 周报数据 ----------
    weeklyReport: {
        totalCarbon: 2.4,
        treesEquivalent: 0.2,
        tasksCompleted: 18,
        totalTasks: 28,
        bestDay: '周三 (0.8kg)',
        activities: [
            { name: '步行', count: 5, carbon: 0.6 },
            { name: '公交出行', count: 3, carbon: 0.5 },
            { name: '光盘行动', count: 4, carbon: 0.4 },
            { name: '垃圾分类', count: 6, carbon: 0.9 }
        ]
    },

    // ---------- Toast 提示文案 ----------
    toastMessages: {
        energyCollected: (amount) => `收取能量 +${amount}g`,
        checkinSuccess: '打卡成功！',
        checkinFailed: '请完成相应任务后再打卡',
        alreadyDone: '今日已完成',
        loginSuccess: '登录成功',
        productExchanged: '兑换成功',
        productAdded: '已加入购物车',
        insufficientPoints: '碳积分不足'
    },

    // ---------- 成就勋章 ----------
    badges: [
        { id: 1, name: '暴走达人', icon: 'ph-sneaker-move', unlocked: true },
        { id: 2, name: '骑行专家', icon: 'ph-bicycle', unlocked: false },
        { id: 3, name: '环保萌芽', icon: 'ph-plant', unlocked: true },
        { id: 4, name: '早起减碳', icon: 'ph-sun-dim', unlocked: true },
        { id: 5, name: '光盘达人', icon: 'ph-bowl-food', unlocked: false },
        { id: 6, name: '植树先锋', icon: 'ph-tree', unlocked: false }
    ]
};
