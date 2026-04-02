/* ================================================
   Supabase 全局初始化（所有页面共享）
   ================================================ */

(function () {
    'use strict';

    if (window.__carbonSupabaseInited) return;

    var lib = typeof supabase !== 'undefined' ? supabase : null;
    if (!lib || typeof lib.createClient !== 'function') {
        console.warn('[Supabase] 未加载 @supabase/supabase-js，已跳过初始化');
        return;
    }

    const SUPABASE_URL = 'https://gkbiydhybnzhlwflcqyr.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrYml5ZGh5Ym56aGx3ZmxjcXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjI3OTAsImV4cCI6MjA5MDY5ODc5MH0.wqQEAoX1L4PwhV9OenrRuRhbIx4g3YBpUHrlSTwRKog';

    window.supabase = lib.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.__carbonSupabaseInited = true;
    console.log('[Supabase] 初始化成功', SUPABASE_URL);

    // 监听登录状态变化
    window.supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            window.dispatchEvent(new CustomEvent('user:signed_in', { detail: session.user }));
        } else if (event === 'SIGNED_OUT') {
            window.dispatchEvent(new CustomEvent('user:signed_out'));
        }
    });
})();
