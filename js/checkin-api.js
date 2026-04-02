/* ================================================
   碳路者·青碳行 - 打卡 API 模块
   调用 Supabase RPC，将打卡数据真实写入数据库
   ================================================ */

(function () {
    'use strict';

    // 测试用户 UUID（与数据库中的 test_user_id 一致）
    var TEST_USER_ID = '2dedd653-78ca-4104-8701-7260700904d5';

    // 缓存 supabase 引用
    function getClient() {
        return window.supabase || null;
    }

    // 统一日志前缀
    function log(msg, data) {
        console.log('[CheckinAPI] ' + msg, data || '');
    }

    function logError(msg, err) {
        console.error('[CheckinAPI] ' + msg, err);
    }

    /**
     * 打卡并加分
     * @param {number} taskId - 任务 ID
     * @param {number} score - 增加的碳积分
     * @param {string} taskTitle - 任务名称
     * @returns {Promise<{success: boolean, error: ?string}>}
     */
    function checkin(taskId, score, taskTitle) {
        var client = getClient();
        if (!client) {
            logError('Supabase 未初始化，跳过 API 调用');
            return Promise.resolve({ success: false, error: 'Supabase 未初始化' });
        }

        log('开始打卡', { taskId: taskId, score: score, taskTitle: taskTitle });

        return client.rpc('checkin_and_add_score', {
            task_id: taskId,
            score_delta: score,
            task_title: taskTitle || '打卡'
        }).then(function (result) {
            if (result.error) {
                logError('打卡 RPC 失败', result.error);
                return { success: false, error: result.error.message };
            }
            log('打卡成功写入数据库', { taskId: taskId, score: score });
            return { success: true };
        }).catch(function (err) {
            logError('打卡请求异常', err);
            return { success: false, error: err.message };
        });
    }

    /**
     * 获取用户当前碳积分（从数据库）
     * @returns {Promise<{score: number, error: ?string}>}
     */
    function getCarbonScore() {
        var client = getClient();
        if (!client) {
            return Promise.resolve({ score: 0, error: 'Supabase 未初始化' });
        }

        return client
            .from('profiles')
            .select('carbon_score')
            .eq('id', TEST_USER_ID)
            .single()
            .then(function (result) {
                if (result.error) {
                    return { score: 0, error: result.error.message };
                }
                return { score: result.data.carbon_score || 0 };
            })
            .catch(function (err) {
                return { score: 0, error: err.message };
            });
    }

    /**
     * 获取用户今日打卡记录
     * @returns {Promise<Array>}
     */
    function getTodayCheckins() {
        var client = getClient();
        if (!client) {
            return Promise.resolve([]);
        }

        return client
            .from('checkin_records')
            .select('task_id, checkin_date')
            .eq('user_id', TEST_USER_ID)
            .eq('checkin_date', new Date().toISOString().split('T')[0])
            .then(function (result) {
                return result.error ? [] : (result.data || []);
            })
            .catch(function () {
                return [];
            });
    }

    // 挂载到全局
    window.CarbonAPI = {
        checkin: checkin,
        getCarbonScore: getCarbonScore,
        getTodayCheckins: getTodayCheckins
    };

    log('CarbonAPI 模块已加载');
})();
