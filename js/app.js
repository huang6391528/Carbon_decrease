/* ================================================
   碳路者·青碳行 - Web Demo 完整交互逻辑
   ================================================ */

(function() {
    'use strict';

    // ========== 核心状态管理 ==========
    const STORAGE_KEY = 'carbon_user_state';

    // 默认状态
    const DEFAULT_STATE = {
        carbonScore: 1286,
        collectedBalls: [],
        completedTasks: [2],
        cartItems: [],          // 购物车项目 { productId, quantity }
        todayScore: 65,
        totalCarbon: 1.28,
        isLoggedIn: false,
        lastVisit: null,
        orders: []              // 订单记录 { id, items: [{productId, name, price, quantity}], totalPrice, status, time }
    };

    // 加载状态
    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return { ...DEFAULT_STATE, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }
        return { ...DEFAULT_STATE };
    }

    // 保存状态
    function saveState(state) {
        try {
            state.lastVisit = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }

    // 全局状态
    let AppState = loadState();

    // ========== Toast 提示 ==========
    function showToast(message, duration = 2000) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), duration);
    }

    // ========== 弹窗组件 ==========
    function showModal(title, content, buttons = []) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-800">${title}</h3>
                    <button class="modal-close w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <i class="ph-bold ph-x text-gray-500"></i>
                    </button>
                </div>
                <div class="modal-body mb-4">${content}</div>
                ${buttons.length > 0 ? '<div class="flex gap-3">' + buttons.map(b => b).join('') + '</div>' : ''}
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay || e.target.closest('.modal-close')) {
                overlay.remove();
            }
        });

        return overlay;
    }

    // ========== 更新积分显示 ==========
    function updateScoreDisplay() {
        document.querySelectorAll('.carbon-score').forEach(el => {
            el.textContent = AppState.carbonScore.toLocaleString();
        });
        document.querySelectorAll('.today-score').forEach(el => {
            el.textContent = AppState.todayScore;
        });
        document.querySelectorAll('.total-carbon').forEach(el => {
            el.textContent = AppState.totalCarbon.toFixed(2);
        });
    }

    // ========== 首页功能 ==========

    // 能量球收集
    function initEnergyBalls() {
        const container = document.getElementById('energy-container');
        if (!container) return;

        // 初始化能量球状态
        document.querySelectorAll('.energy-ball').forEach(ball => {
            const ballId = parseInt(ball.dataset.id, 10);
            if (AppState.collectedBalls.includes(ballId)) {
                ball.classList.add('collected');
                ball.querySelector('.ball-icon').style.opacity = '0.3';
            }
        });

        container.addEventListener('click', function(e) {
            const ball = e.target.closest('.energy-ball');
            if (!ball || ball.classList.contains('collected')) return;

            const ballId = parseInt(ball.dataset.id, 10);
            const amount = parseInt(ball.dataset.amount, 10);
            const type = ball.dataset.type;
            const rect = ball.getBoundingClientRect();

            // 收集动画
            ball.classList.add('collected');
            ball.querySelector('.ball-icon').style.opacity = '0.3';

            // 弹出分数动画
            const popup = document.createElement('div');
            popup.className = 'score-popup';
            popup.textContent = `+${amount}g`;
            popup.style.left = (rect.left + rect.width / 2 - 20) + 'px';
            popup.style.top = (rect.top + 20) + 'px';
            document.body.appendChild(popup);

            // 更新状态
            AppState.collectedBalls.push(ballId);
            AppState.carbonScore += amount;
            AppState.todayScore += amount;
            saveState(AppState);

            // 更新显示
            updateScoreDisplay();

            // 显示提示
            showToast(`收取${type}能量 +${amount}g`);

            // 清理动画元素
            setTimeout(() => {
                popup.remove();
            }, 1000);
        });
    }

    // 资讯点击
    function initArticles() {
        document.querySelectorAll('.article-item').forEach(item => {
            item.addEventListener('click', function() {
                const articleId = parseInt(this.dataset.id, 10);
                const article = MockData.articles.find(a => a.id === articleId);
                if (!article) return;

                const content = `
                    <img src="${article.image}" alt="${article.title}" class="w-full h-32 object-cover rounded-xl mb-3">
                    <div class="text-gray-600 text-sm leading-relaxed">${article.content}</div>
                    <div class="flex items-center gap-2 mt-3 text-xs text-gray-400">
                        <span>${article.category}</span>
                        <span>|</span>
                        <span>${article.views.toLocaleString()} 阅读</span>
                    </div>
                `;

                showModal(article.title, content, [
                    '<button class="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-medium modal-close">知道了</button>'
                ]);
            });
        });
    }

    // 活动卡片点击
    function initActivityCard() {
        const card = document.querySelector('.activity-card');
        if (!card) return;

        card.addEventListener('click', function() {
            const competition = MockData.campusCompetition;
            const content = `
                <div class="text-center mb-4">
                    <div class="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        <i class="ph-bold ph-flag-banner text-blue-600 text-3xl"></i>
                    </div>
                    <h4 class="text-lg font-bold text-gray-800">${competition.name}</h4>
                    <p class="text-gray-500 text-sm mt-1">${competition.description}</p>
                </div>
                <div class="bg-blue-50 rounded-xl p-4 mb-3">
                    <div class="flex items-center justify-between text-sm mb-2">
                        <span class="text-blue-700 font-medium">参赛学校</span>
                        <span class="text-blue-600">${competition.participants.join(' VS ')}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm mb-2">
                        <span class="text-blue-700 font-medium">活动时间</span>
                        <span class="text-blue-600">${competition.startDate} 至 ${competition.endDate}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-blue-700 font-medium">活动奖励</span>
                        <span class="text-blue-600">${competition.reward}</span>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="flex items-center justify-between text-sm mb-2">
                        <span class="text-gray-600">当前进度</span>
                        <span class="text-emerald-600 font-medium">${competition.progress}%</span>
                    </div>
                    <div class="w-full bg-blue-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${competition.progress}%"></div>
                    </div>
                </div>
            `;

            showModal('活动详情', content, [
                '<button class="flex-1 bg-blue-500 text-white py-2 rounded-xl font-medium modal-close">参与活动</button>'
            ]);
        });
    }

    // ========== 打卡页功能 ==========

    // 更新打卡进度显示
    function updateCheckinProgress() {
        const completed = AppState.completedTasks.length;
        const total = MockData.checkinTasks.length;
        document.querySelectorAll('.checkin-progress').forEach(el => {
            el.textContent = `(${completed}/${total})`;
        });

        // 更新打卡任务卡片中的显示
        const checkinCount = document.querySelector('.checkin-count');
        if (checkinCount) {
            checkinCount.textContent = completed;
        }

        // 更新进度条
        const progressBar = document.querySelector('.checkin-progress-bar');
        if (progressBar) {
            progressBar.style.width = (completed / total * 100) + '%';
        }
    }

    // 初始化打卡任务
    function initCheckinTasks() {
        // 恢复已完成状态
        document.querySelectorAll('.checkin-btn[data-task-id]').forEach(btn => {
            const taskId = parseInt(btn.dataset.taskId, 10);
            if (AppState.completedTasks.includes(taskId)) {
                btn.textContent = '已完成 ✓';
                btn.classList.remove('bg-emerald-500', 'text-white');
                btn.classList.add('bg-gray-100', 'text-gray-400', 'completed');
                btn.disabled = true;
                btn.closest('.task-item')?.classList.add('opacity-60');
            }
        });

        // 绑定点击事件
        document.querySelectorAll('.checkin-btn[data-task-id]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const taskId = parseInt(this.dataset.taskId, 10);

                if (AppState.completedTasks.includes(taskId)) {
                    showToast('今日已完成该任务');
                    return;
                }

                const task = MockData.checkinTasks.find(t => t.id === taskId);
                if (!task) return;

                if (task.reward > 0) {
                    // 执行打卡
                    AppState.completedTasks.push(taskId);
                    AppState.carbonScore += task.reward;
                    AppState.todayScore += task.reward;
                    saveState(AppState);

                    // 更新按钮
                    this.textContent = '已完成 ✓';
                    this.classList.remove('bg-emerald-500', 'text-white');
                    this.classList.add('bg-gray-100', 'text-gray-400', 'completed');
                    this.disabled = true;
                    this.closest('.task-item')?.classList.add('opacity-60');

                    // 更新显示
                    updateCheckinProgress();
                    updateScoreDisplay();

                    showToast(`打卡成功！ +${task.reward}g`);

                    // 调用真实 API 写入数据库（静默失败不影响体验）
                    if (window.CarbonAPI) {
                        CarbonAPI.checkin(taskId, task.reward, task.title).catch(function(err) {
                            console.error('[App] 打卡API调用失败:', err);
                        });
                    }
                } else {
                    showToast('请完成相应任务后再打卡');
                }
            });
        });
    }

    // 周报入口
    function initWeeklyReport() {
        const card = document.querySelector('.weekly-report-card');
        if (!card) return;

        card.addEventListener('click', function() {
            const report = MockData.weeklyReport;
            const activityHtml = report.activities.map(a => `
                <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span class="text-gray-600 text-sm">${a.name}</span>
                    <div class="text-right">
                        <span class="text-emerald-600 font-medium text-sm">${a.carbon}kg</span>
                        <span class="text-gray-400 text-xs ml-2">${a.count}次</span>
                    </div>
                </div>
            `).join('');

            const content = `
                <div class="text-center mb-4">
                    <div class="text-4xl font-bold text-emerald-600">${report.totalCarbon}kg</div>
                    <div class="text-gray-500 text-sm mt-1">本周累计减碳量</div>
                </div>
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div class="bg-emerald-50 rounded-xl p-3 text-center">
                        <div class="text-2xl font-bold text-emerald-600">${report.treesEquivalent}</div>
                        <div class="text-gray-500 text-xs">相当于种树</div>
                    </div>
                    <div class="bg-blue-50 rounded-xl p-3 text-center">
                        <div class="text-2xl font-bold text-blue-600">${report.tasksCompleted}</div>
                        <div class="text-gray-500 text-xs">完成任务</div>
                    </div>
                </div>
                <div class="bg-gray-50 rounded-xl p-3 mb-3">
                    <div class="flex items-center justify-between text-sm mb-1">
                        <span class="text-gray-600">本周最佳日</span>
                        <span class="text-emerald-600 font-medium">${report.bestDay}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600">任务完成率</span>
                        <span class="text-emerald-600 font-medium">${Math.round(report.tasksCompleted / report.totalTasks * 100)}%</span>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="text-gray-700 font-medium text-sm mb-2">减碳明细</div>
                    ${activityHtml}
                </div>
            `;

            showModal('本周减碳周报', content, [
                '<button class="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-medium modal-close">继续加油</button>'
            ]);
        });
    }

    // ========== 动态页功能 ==========

    // Tab切换
    function initRankTabs() {
        const tabs = document.querySelectorAll('.rank-tab');
        const rankContent = document.getElementById('rank-content');
        const feedContent = document.getElementById('feed-content');

        if (tabs.length === 0) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => {
                    t.classList.remove('active', 'text-emerald-600');
                    t.classList.add('text-gray-400');
                    const underline = t.querySelector('.tab-underline');
                    if (underline) underline.classList.add('hidden');
                });

                this.classList.add('active', 'text-emerald-600');
                this.classList.remove('text-gray-400');
                const underline = this.querySelector('.tab-underline');
                if (underline) underline.classList.remove('hidden');

                const tabName = this.dataset.tab;
                if (tabName === 'rank') {
                    rankContent?.classList.remove('hidden');
                    feedContent?.classList.add('hidden');
                } else {
                    rankContent?.classList.add('hidden');
                    feedContent?.classList.remove('hidden');
                }
            });
        });
    }

    // ========== 商城页功能 ==========

    // 获取购物车中的商品信息
    function getCartItemsWithProducts() {
        return AppState.cartItems.map(item => {
            const product = MockData.products.find(p => p.id === item.productId);
            return {
                ...item,
                product: product,
                subtotal: product ? product.price * item.quantity : 0
            };
        }).filter(item => item.product);
    }

    // 获取购物车总价格
    function getCartTotal() {
        return getCartItemsWithProducts().reduce((sum, item) => sum + item.subtotal, 0);
    }

    // 获取购物车总数量
    function getCartTotalQuantity() {
        return AppState.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }

    // 商品点击
    function initProductCards() {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // 如果点击的是兑换按钮，不打开详情
                if (e.target.closest('.exchange-btn') || e.target.closest('.quick-exchange-btn')) return;

                const productId = parseInt(this.dataset.id, 10);
                const product = MockData.products.find(p => p.id === productId);
                if (!product) return;

                const stockText = product.stock ? `<span class="text-orange-500">仅剩 ${product.stock} 件</span>` : `<span class="text-gray-400">库存充足</span>`;
                const cartQuantity = AppState.cartItems.find(item => item.productId === productId)?.quantity || 0;

                const content = `
                    <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-cover rounded-xl mb-3">
                    <div class="mb-3">
                        <h4 class="text-lg font-bold text-gray-800 mb-1">${product.name}</h4>
                        <div class="flex items-center gap-2">
                            <span class="text-2xl font-bold text-emerald-600">${product.price}<span class="text-sm">g</span></span>
                            ${product.originalPrice ? `<span class="text-gray-400 text-sm line-through">${product.originalPrice}g</span>` : ''}
                        </div>
                        <div class="mt-1">${stockText}</div>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-3 mb-3">
                        <div class="text-sm text-gray-600">${product.category}</div>
                        <div class="text-sm text-gray-500 mt-1">${product.sold > 0 ? `已有 ${product.sold.toLocaleString()} 人兑换` : '新品上架'}</div>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3 bg-gray-100 rounded-xl px-2 py-1">
                            <button class="cart-minus w-8 h-8 rounded-full bg-white flex items-center justify-center" data-id="${product.id}">
                                <i class="ph-bold ph-minus text-gray-600"></i>
                            </button>
                            <span class="cart-quantity text-center w-8 font-medium">${cartQuantity}</span>
                            <button class="cart-plus w-8 h-8 rounded-full bg-white flex items-center justify-center" data-id="${product.id}">
                                <i class="ph-bold ph-plus text-gray-600"></i>
                            </button>
                        </div>
                        <button class="exchange-btn bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold" data-id="${product.id}" data-price="${product.price}">
                            立即兑换
                        </button>
                    </div>
                `;

                const modal = showModal('商品详情', content);

                // 绑定增加按钮
                modal.querySelector('.cart-plus')?.addEventListener('click', function() {
                    const id = parseInt(this.dataset.id, 10);
                    const existingItem = AppState.cartItems.find(item => item.productId === id);
                    if (existingItem) {
                        existingItem.quantity++;
                    } else {
                        AppState.cartItems.push({ productId: id, quantity: 1 });
                    }
                    saveState(AppState);
                    updateCartBadge();
                    // 更新弹窗中的数量
                    const newQty = AppState.cartItems.find(item => item.productId === id)?.quantity || 0;
                    modal.querySelector('.cart-quantity').textContent = newQty;
                });

                // 绑定减少按钮
                modal.querySelector('.cart-minus')?.addEventListener('click', function() {
                    const id = parseInt(this.dataset.id, 10);
                    const existingItem = AppState.cartItems.find(item => item.productId === id);
                    if (existingItem) {
                        if (existingItem.quantity > 1) {
                            existingItem.quantity--;
                        } else {
                            AppState.cartItems = AppState.cartItems.filter(item => item.productId !== id);
                        }
                        saveState(AppState);
                        updateCartBadge();
                        // 更新弹窗中的数量
                        const newQty = AppState.cartItems.find(item => item.productId === id)?.quantity || 0;
                        modal.querySelector('.cart-quantity').textContent = newQty;
                    }
                });

                // 绑定兑换按钮 - 立即兑换当前商品
                modal.querySelector('.exchange-btn')?.addEventListener('click', function() {
                    const productId = parseInt(this.dataset.id, 10);
                    const price = parseInt(this.dataset.price, 10);
                    const product = MockData.products.find(p => p.id === productId);

                    if (AppState.carbonScore >= price) {
                        AppState.carbonScore -= price;

                        // 创建订单
                        const order = {
                            id: 'ORD' + Date.now(),
                            items: [{
                                productId: productId,
                                name: product.name,
                                price: price,
                                quantity: 1,
                                image: product.image
                            }],
                            totalPrice: price,
                            status: '待领取',
                            time: new Date().toLocaleString('zh-CN')
                        };
                        AppState.orders.unshift(order);

                        // 从购物车移除（如果有）
                        AppState.cartItems = AppState.cartItems.filter(item => item.productId !== productId);

                        saveState(AppState);
                        updateScoreDisplay();
                        updateCartBadge();
                        modal.remove();
                        showToast('兑换成功！请到订单页领取');
                    } else {
                        showToast('碳积分不足');
                    }
                });
            });
        });
    }

    // 更新购物车Badge
    function updateCartBadge() {
        document.querySelectorAll('.cart-badge').forEach(badge => {
            const count = getCartTotalQuantity();
            badge.textContent = count;
            badge.classList.toggle('hidden', count === 0);
        });
    }

    // 搜索功能
    function initSearchBox() {
        const input = document.getElementById('search-input');
        if (!input) return;

        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                showToast(`搜索: ${this.value.trim()}`);
            }
        });
    }

    // 分类切换
    function initCategoryTabs() {
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.category-tab').forEach(t => {
                    t.classList.remove('ring-2', 'ring-emerald-500');
                });
                this.classList.add('ring-2', 'ring-emerald-500');

                const category = this.dataset.category;
                showToast(`切换到${category}`);
            });
        });
    }

    // 快速兑换按钮
    function initQuickExchange() {
        document.querySelectorAll('.quick-exchange-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const card = this.closest('.product-card');
                const productId = parseInt(card.dataset.id, 10);
                const product = MockData.products.find(p => p.id === productId);

                if (AppState.carbonScore >= product.price) {
                    AppState.carbonScore -= product.price;

                    // 创建订单
                    const order = {
                        id: 'ORD' + Date.now(),
                        items: [{
                            productId: productId,
                            name: product.name,
                            price: product.price,
                            quantity: 1,
                            image: product.image
                        }],
                        totalPrice: product.price,
                        status: '待领取',
                        time: new Date().toLocaleString('zh-CN')
                    };
                    AppState.orders.unshift(order);

                    saveState(AppState);
                    updateScoreDisplay();
                    showToast('兑换成功！请到订单页领取');
                } else {
                    showToast('碳积分不足');
                }
            });
        });
    }

    // ========== 商城页 - 加入购物车按钮 ==========

    function initMallCartButtons() {
        document.querySelectorAll('.cart-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = parseInt(this.dataset.id, 10);
                const existingItem = AppState.cartItems.find(function(item) { return item.productId === productId; });
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    AppState.cartItems.push({ productId: productId, quantity: 1 });
                }
                saveState(AppState);
                updateCartBadge();
                showToast('已加入购物车');
            });
        });
    }

    // ========== 购物车页功能 ==========

    function initCartPage() {
        renderCartItems();

        // 结算按钮
        document.getElementById('checkout-btn')?.addEventListener('click', function() {
            if (AppState.cartItems.length === 0) {
                showToast('购物车是空的');
                return;
            }

            const total = getCartTotal();
            if (AppState.carbonScore < total) {
                showToast('碳积分不足');
                return;
            }

            // 扣除积分
            AppState.carbonScore -= total;

            // 创建订单
            const orderItems = AppState.cartItems.map(item => {
                const product = MockData.products.find(p => p.id === item.productId);
                return {
                    productId: item.productId,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    image: product.image
                };
            });

            const order = {
                id: 'ORD' + Date.now(),
                items: orderItems,
                totalPrice: total,
                status: '待领取',
                time: new Date().toLocaleString('zh-CN')
            };
            AppState.orders.unshift(order);

            // 清空购物车
            AppState.cartItems = [];

            saveState(AppState);
            updateScoreDisplay();
            updateCartBadge();

            showToast('兑换成功！请到订单页领取');
            renderCartItems();
        });

        // 全选功能
        document.getElementById('select-all')?.addEventListener('change', function() {
            const checked = this.checked;
            document.querySelectorAll('.cart-item-checkbox').forEach(cb => {
                cb.checked = checked;
            });
            updateCartTotal();
        });
    }

    function renderCartItems() {
        const container = document.getElementById('cart-items-container');
        const emptyContainer = document.getElementById('cart-empty');
        const totalContainer = document.getElementById('cart-total-container');

        if (!container) return;

        const items = getCartItemsWithProducts();

        if (items.length === 0) {
            container.innerHTML = '';
            emptyContainer?.classList.remove('hidden');
            totalContainer?.classList.add('hidden');
            return;
        }

        emptyContainer?.classList.add('hidden');
        totalContainer?.classList.remove('hidden');

        container.innerHTML = items.map(item => `
            <div class="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm" data-product-id="${item.productId}">
                <input type="checkbox" class="cart-item-checkbox w-5 h-5 rounded accent-emerald-500" checked>
                <img src="${item.product.image}" alt="${item.product.name}" class="w-16 h-16 rounded-xl object-cover">
                <div class="flex-1">
                    <div class="text-gray-800 text-sm font-medium line-clamp-1">${item.product.name}</div>
                    <div class="text-emerald-600 text-sm font-bold mt-1">${item.product.price}g</div>
                </div>
                <div class="flex items-center gap-2">
                    <button class="cart-item-minus w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                        <i class="ph-bold ph-minus text-xs text-gray-500"></i>
                    </button>
                    <span class="cart-item-qty w-6 text-center text-sm font-medium">${item.quantity}</span>
                    <button class="cart-item-plus w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                        <i class="ph-bold ph-plus text-xs text-emerald-600"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // 绑定事件
        container.querySelectorAll('.cart-item-plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('[data-product-id]');
                const productId = parseInt(card.dataset.productId, 10);
                const item = AppState.cartItems.find(i => i.productId === productId);
                if (item) {
                    item.quantity++;
                    saveState(AppState);
                    updateCartBadge();
                    renderCartItems();
                    updateCartTotal();
                }
            });
        });

        container.querySelectorAll('.cart-item-minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('[data-product-id]');
                const productId = parseInt(card.dataset.productId, 10);
                const item = AppState.cartItems.find(i => i.productId === productId);
                if (item) {
                    if (item.quantity > 1) {
                        item.quantity--;
                    } else {
                        AppState.cartItems = AppState.cartItems.filter(i => i.productId !== productId);
                    }
                    saveState(AppState);
                    updateCartBadge();
                    renderCartItems();
                    updateCartTotal();
                }
            });
        });

        container.querySelectorAll('.cart-item-checkbox').forEach(cb => {
            cb.addEventListener('change', updateCartTotal);
        });

        updateCartTotal();
    }

    function updateCartTotal() {
        const container = document.getElementById('cart-items-container');
        const totalPriceEl = document.getElementById('total-price');
        const totalCountEl = document.getElementById('total-count');

        if (!container || !totalPriceEl || !totalCountEl) return;

        let total = 0;
        let count = 0;

        container.querySelectorAll('[data-product-id]').forEach(card => {
            const checkbox = card.querySelector('.cart-item-checkbox');
            if (checkbox.checked) {
                const productId = parseInt(card.dataset.productId, 10);
                const item = AppState.cartItems.find(i => i.productId === productId);
                const product = MockData.products.find(p => p.id === productId);
                if (item && product) {
                    total += product.price * item.quantity;
                    count += item.quantity;
                }
            }
        });

        totalPriceEl.textContent = total;
        totalCountEl.textContent = count;
    }

    // ========== 订单页功能 ==========

    function initOrdersPage() {
        renderOrders();
    }

    function renderOrders() {
        const container = document.getElementById('orders-container');
        const emptyContainer = document.getElementById('orders-empty');

        if (!container) return;

        if (AppState.orders.length === 0) {
            container.innerHTML = '';
            emptyContainer?.classList.remove('hidden');
            return;
        }

        emptyContainer?.classList.add('hidden');

        container.innerHTML = AppState.orders.map(order => `
            <div class="bg-white rounded-2xl p-4 shadow-sm mb-3" data-order-id="${order.id}">
                <div class="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <div>
                        <span class="text-gray-400 text-xs">订单号</span>
                        <span class="text-gray-600 text-xs ml-2">${order.id}</span>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}">${order.status}</span>
                </div>
                ${order.items.map(item => `
                    <div class="flex items-center gap-3 mb-3">
                        <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-xl object-cover">
                        <div class="flex-1">
                            <div class="text-gray-800 text-sm font-medium line-clamp-1">${item.name}</div>
                            <div class="flex items-center justify-between mt-1">
                                <span class="text-emerald-600 text-sm font-bold">${item.price}g</span>
                                <span class="text-gray-400 text-xs">x${item.quantity}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
                <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                        <span class="text-gray-400 text-xs">${order.time}</span>
                    </div>
                    <div class="text-right">
                        <span class="text-gray-500 text-xs">合计：</span>
                        <span class="text-emerald-600 font-bold">${order.totalPrice}g</span>
                    </div>
                </div>
                ${order.status === '待领取' ? `
                    <div class="mt-3 flex justify-end">
                        <button class="receive-btn px-4 py-1.5 bg-emerald-500 text-white text-xs rounded-lg font-medium">确认领取</button>
                    </div>
                ` : ''}
            </div>
        `).join('');

        // 绑定领取按钮
        container.querySelectorAll('.receive-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('[data-order-id]');
                const orderId = card.dataset.orderId;
                const order = AppState.orders.find(o => o.id === orderId);
                if (order) {
                    order.status = '已领取';
                    saveState(AppState);
                    renderOrders();
                    showToast('领取成功！');
                }
            });
        });
    }

    function getStatusClass(status) {
        switch (status) {
            case '待领取': return 'bg-orange-100 text-orange-600';
            case '已领取': return 'bg-emerald-100 text-emerald-600';
            case '已完成': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    }

    // ========== 个人中心功能 ==========

    // 功能菜单点击
    function initProfileMenus() {
        document.querySelectorAll('.profile-menu-item').forEach(item => {
            item.addEventListener('click', function() {
                const type = this.dataset.type;
                let title = '';
                let content = '';

                switch (type) {
                    case 'achievements':
                        const badgesHtml = MockData.badges.map(b => `
                            <div class="flex flex-col items-center p-3 ${b.unlocked ? '' : 'opacity-40'}">
                                <div class="w-14 h-14 rounded-2xl ${b.unlocked ? 'bg-emerald-100' : 'bg-gray-100'} flex items-center justify-center mb-2">
                                    <i class="ph-bold ${b.icon} text-2xl ${b.unlocked ? 'text-emerald-600' : 'text-gray-400'}"></i>
                                </div>
                                <span class="text-xs text-gray-600 text-center">${b.name}</span>
                            </div>
                        `).join('');
                        title = '我的成就';
                        content = `<div class="grid grid-cols-3 gap-2">${badgesHtml}</div>`;
                        break;
                    case 'trees':
                        title = '我的树苗';
                        content = `
                            <div class="text-center mb-4">
                                <div class="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                    <i class="ph-bold ph-tree text-emerald-600 text-4xl"></i>
                                </div>
                                <div class="text-2xl font-bold text-emerald-600">${MockData.user.treesPlanted} 棵</div>
                                <div class="text-gray-500 text-sm">已种植的树木</div>
                            </div>
                            <div class="bg-emerald-50 rounded-xl p-4 text-center">
                                <p class="text-emerald-700 text-sm">每一棵树都在为地球吸收二氧化碳</p>
                                <p class="text-emerald-600 text-sm mt-2 font-medium">累计减少 ${(MockData.user.treesPlanted * 21).toFixed(1)}kg CO₂</p>
                            </div>
                        `;
                        break;
                    case 'history':
                        window.location.href = 'verification.html';
                        return;
                    case 'settings':
                        showModal('设置', `
                            <div class="space-y-2">
                                <a href="announcements.html" class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <i class="ph-bold ph-bell text-gray-500"></i>
                                        <span class="text-gray-700">消息通知</span>
                                    </div>
                                    <i class="ph-bold ph-caret-right text-gray-400"></i>
                                </a>
                                <a href="help.html" class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <i class="ph-bold ph-question text-gray-500"></i>
                                        <span class="text-gray-700">帮助与反馈</span>
                                    </div>
                                    <i class="ph-bold ph-caret-right text-gray-400"></i>
                                </a>
                                <a href="about.html" class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <i class="ph-bold ph-info text-gray-500"></i>
                                        <span class="text-gray-700">关于我们</span>
                                    </div>
                                    <i class="ph-bold ph-caret-right text-gray-400"></i>
                                </a>
                            </div>
                        `, ['<button class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-medium modal-close">关闭</button>']);
                        return;
                    case 'settings':
                        title = '设置';
                        content = `
                            <div class="space-y-2">
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <i class="ph-bold ph-bell text-gray-500"></i>
                                        <span class="text-gray-700">消息通知</span>
                                    </div>
                                    <i class="ph-bold ph-caret-right text-gray-400"></i>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <i class="ph-bold ph-lock text-gray-500"></i>
                                        <span class="text-gray-700">隐私设置</span>
                                    </div>
                                    <i class="ph-bold ph-caret-right text-gray-400"></i>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <i class="ph-bold ph-info text-gray-500"></i>
                                        <span class="text-gray-700">关于我们</span>
                                    </div>
                                    <i class="ph-bold ph-caret-right text-gray-400"></i>
                                </div>
                            </div>
                        `;
                        break;
                    case 'orders':
                        window.location.href = 'orders.html';
                        return;
                    case 'cart':
                        window.location.href = 'cart.html';
                        return;
                    default:
                        showToast('功能开发中');
                        return;
                }

                showModal(title, content, [
                    '<button class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-medium modal-close">关闭</button>'
                ]);
            });
        });
    }

    // ECharts 图表
    function initECharts() {
        if (typeof echarts === 'undefined') return;

        const chartDom = document.getElementById('chart');
        if (!chartDom) return;

        const myChart = echarts.init(chartDom);
        const option = {
            grid: { top: 10, bottom: 20, left: 30, right: 10 },
            xAxis: {
                type: 'category',
                data: MockData.carbonTrend.dates,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: '#94a3b8', fontSize: 10 }
            },
            yAxis: {
                type: 'value',
                splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
                axisLabel: { color: '#94a3b8', fontSize: 10 }
            },
            series: [{
                data: MockData.carbonTrend.values,
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { color: '#10b981', width: 3 },
                itemStyle: { color: '#10b981' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
                        { offset: 1, color: 'rgba(16, 185, 129, 0)' }
                    ])
                }
            }]
        };
        myChart.setOption(option);
    }

    // ========== 登录页功能 ==========

    function initLoginForm() {
        const loginBtn = document.getElementById('login-btn');
        const phoneInput = document.getElementById('phone-input');
        const codeInput = document.getElementById('code-input');
        const agreeCheckbox = document.getElementById('agree-checkbox');
        const getCodeBtn = document.getElementById('get-code-btn');

        if (!loginBtn) return;

        // 获取验证码
        if (getCodeBtn) {
            getCodeBtn.addEventListener('click', function() {
                const phone = phoneInput?.value.trim() || '';
                if (!phone || phone.length < 11) {
                    showToast('请输入正确的手机号');
                    return;
                }

                let seconds = 60;
                this.disabled = true;
                this.textContent = `${seconds}s 后重试`;

                const timer = setInterval(() => {
                    seconds--;
                    if (seconds <= 0) {
                        clearInterval(timer);
                        this.disabled = false;
                        this.textContent = '获取验证码';
                    } else {
                        this.textContent = `${seconds}s 后重试`;
                    }
                }, 1000);

                showToast('验证码已发送');
            });
        }

        // 登录
        loginBtn.addEventListener('click', function() {
            const phone = phoneInput?.value.trim() || '';
            const code = codeInput?.value.trim() || '';
            const agreed = agreeCheckbox?.checked || false;

            if (!phone || phone.length < 11) {
                showToast('请输入正确的手机号');
                return;
            }

            if (!code || code.length < 6) {
                showToast('请输入6位验证码');
                return;
            }

            if (!agreed) {
                showToast('请先阅读并同意用户协议');
                return;
            }

            // 模拟登录
            AppState.isLoggedIn = true;
            saveState(AppState);

            showToast('登录成功');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }

    // ========== 主初始化 ==========
    function init() {
        // 根据页面初始化对应功能
        const page = document.body.dataset.page || detectPage();

        switch (page) {
            case 'index':
                initEnergyBalls();
                initArticles();
                initActivityCard();
                break;
            case 'checkin':
                initCheckinTasks();
                initWeeklyReport();
                break;
            case 'social':
                initRankTabs();
                break;
            case 'mall':
                initProductCards();
                initSearchBox();
                initCategoryTabs();
                initQuickExchange();
                initMallCartButtons();
                updateCartBadge();
                break;
            case 'cart':
                initCartPage();
                break;
            case 'orders':
                initOrdersPage();
                break;
            case 'profile':
                initECharts();
                initProfileMenus();
                break;
            case 'login':
                initLoginForm();
                break;
        }

        // 通用初始化
        updateScoreDisplay();
        updateCheckinProgress();
        updateCartBadge();
    }

    function detectPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename.replace('.html', '');
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
