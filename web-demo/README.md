# 碳路者·青碳行 - Web Demo

校园低碳生活互动原型，基于原型二改造的可交互 Web 版本。

## 项目结构

```
web-demo/
├── css/
│   └── style.css          # 全局样式（动画、Toast、Tab等）
├── js/
│   ├── mock-data.js       # 模拟数据层
│   └── app.js             # 交互逻辑
├── index.html             # 首页（能量球打卡）
├── checkin.html           # 打卡页（任务打卡）
├── social.html            # 动态页（排行榜、动态墙）
├── mall.html              # 商城页（商品列表）
├── profile.html           # 个人中心（图表统计）
└── login.html             # 登录页（手机验证码）
```

## 功能特性

### 已实现交互

1. **首页**
   - 点击能量球收集碳积分（动画效果 + Toast提示）
   - 实时更新顶部碳积分显示
   - 底部导航高亮

2. **打卡页**
   - 任务打卡按钮（可点击执行打卡）
   - 打卡成功后积分增加
   - 进度显示 (X/4)
   - 已完成任务显示完成状态

3. **动态页**
   - 排行榜/动态墙 Tab 切换
   - 当前用户高亮显示

4. **商城页**
   - 商品卡片点击提示
   - 搜索框回车搜索
   - 底部导航高亮

5. **个人中心**
   - ECharts 减排趋势图表
   - 用户信息展示
   - 成就勋章展示

6. **登录页**
   - 表单验证（手机号、验证码）
   - 验证码倒计时
   - 登录成功跳转

## 如何预览

### 方法一：直接打开
在文件管理器中双击 `index.html` 打开预览

### 方法二：本地服务器（推荐）
```bash
# 进入 web-demo 目录
cd web-demo

# Python 方式
python -m http.server 8080

# Node.js 方式
npx serve .

# 然后浏览器访问 http://localhost:8080
```

### 方法三：VSCode Live Server
1. 在 VSCode 中安装 "Live Server" 插件
2. 右键点击 `index.html` -> "Open with Live Server"

## 技术栈

- **CSS框架**: Tailwind CSS (CDN)
- **图标**: Phosphor Icons
- **图表**: ECharts
- **字体**: Noto Sans SC
- **交互**: 原生 JavaScript

## 数据说明

所有数据存储在 `js/mock-data.js` 中，采用 Mock 数据方式。
如需对接后端，只需替换数据请求逻辑即可。

## 后续扩展

- [ ] 添加更多页面（详情页、设置页等）
- [ ] 添加动画过渡效果
- [ ] 对接真实后端 API
- [ ] 添加用户登录状态管理
- [ ] 迁移到微信小程序

## 注意事项

1. 外部资源依赖 CDN，确保网络连接正常
2. 部分浏览器可能需要启动本地服务器才能正常加载资源
3. ECharts 需要在页面完全加载后初始化

## 版权说明

本项目仅供学习交流使用，图片资源来源于互联网。
