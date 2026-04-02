(function () {
    'use strict';

    function showToast(message, duration) {
        duration = duration || 2000;
        var existing = document.querySelector('.toast');
        if (existing) existing.remove();
        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function () {
            toast.remove();
        }, duration);
    }

    function bindSendCode() {
        var btn = document.getElementById('send-code-btn');
        if (!btn) return;
        var origText = btn.textContent;
        var timer = null;
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (btn.disabled) return;
            var sec = 60;
            btn.disabled = true;
            btn.textContent = sec + 's';
            if (timer) clearInterval(timer);
            timer = setInterval(function () {
                sec--;
                if (sec <= 0) {
                    clearInterval(timer);
                    timer = null;
                    btn.disabled = false;
                    btn.textContent = origText;
                } else {
                    btn.textContent = sec + 's';
                }
            }, 1000);
        });
    }

    function bindEvents() {
        bindSendCode();
        var loginBtn = document.getElementById('login-btn');
        if (!loginBtn) return;

        loginBtn.addEventListener('click', function (e) {
            e.preventDefault();
            var phoneInput = document.getElementById('phone-input');
            var codeInput = document.getElementById('code-input');
            var agreeCheckbox = document.getElementById('agree-checkbox');

            var phone = phoneInput ? phoneInput.value.trim() : '';
            var code = codeInput ? codeInput.value.trim() : '';
            var agreed = agreeCheckbox ? agreeCheckbox.checked : false;

            if (!agreed) {
                showToast('请先阅读并同意用户协议');
                return;
            }
            if (phone !== '12345600000') {
                showToast('手机号或验证码错误');
                return;
            }
            if (code !== '123456') {
                showToast('手机号或验证码错误');
                return;
            }

            // 死账号登录成功
            var saved = JSON.parse(localStorage.getItem('carbon_user_state') || '{}');
            saved.isLoggedIn = true;
            localStorage.setItem('carbon_user_state', JSON.stringify(saved));
            showToast('登录成功');
            setTimeout(function () {
                window.location.href = 'index.html';
            }, 1000);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindEvents);
    } else {
        bindEvents();
    }
})();
