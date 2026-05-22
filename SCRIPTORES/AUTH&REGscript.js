async function hashPassword(pw) {
    const enc = new TextEncoder();
    const data = enc.encode(pw);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function getUsers() {
    try {
        const raw = localStorage.getItem('semantic_users');
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }

}

function setUsers(users) {
    localStorage.setItem('semantic_users', JSON.stringify(users));
}

function setCurrentUser(user) {
    localStorage.setItem('semantic_current_user', JSON.stringify(user));
}

function getCurrentUser() {
    try {
        const raw = localStorage.getItem('semantic_current_user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

class NotificationManager {
    static show(message, type = 'success', duration = 2000) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }
}

function SWITCHhref() {
    const user = getCurrentUser();
    const authLink = document.getElementById('authLink');
    
    if (!authLink) return;
    
    if (user) {
        authLink.textContent = 'Личный кабинет';
        authLink.href = 'PROFILE.html'; 
    } else {
        authLink.textContent = 'Авторизация';
        authLink.href = 'AUTHORIZATION.html'; 
    }
}

function logout() {
    localStorage.removeItem('semantic_current_user');
    NotificationManager.show('Вы вышли из системы', 'success'); 
    SWITCHhref();
    
    setTimeout(() => {
        window.location.href = 'MY_MUSIC.html';
    }, 1500);
}

function loadUserProfileData() {
    const user = getCurrentUser();
    
    if (!user) {
        console.warn('Пользователь не авторизован');
        return;
    }
    
    const nameDATA = document.getElementById('nameDATA');
    const famField = document.getElementById('infoFam');
    const emailField = document.getElementById('infoEmail');
    const regDateField = document.getElementById('infoRegDate');
    
    if (nameDATA) nameDATA.value = user.name || '';
    if (famField) famField.value = user.fam || '';
    if (emailField) emailField.value = user.email || '';
    
    if (regDateField) {
        if (user.createdAt) {
            const date = new Date(user.createdAt);
            regDateField.value = date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            regDateField.value = 'Не указана';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    SWITCHhref();
    
    if (document.getElementById('nameDATA') || document.getElementById('infoFam')) {
        loadUserProfileData();
    }
    
    const tabs = document.querySelectorAll('.AUTHtabBTN');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (tabs.length) {
        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                tabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.dataset.tab;
                
                if (loginForm) loginForm.classList.add('hidden');
                if (registerForm) registerForm.classList.add('hidden');
                
                if (tab === 'login') {
                    if (loginForm) loginForm.classList.remove('hidden');
                } else if (tab === 'register') {
                    if (registerForm) registerForm.classList.remove('hidden');
                }

                if (loginError) loginError.textContent = '';
                if (registerError) registerError.textContent = '';
            });
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (loginError) loginError.textContent = '';
            
            const email = loginForm.email.value.trim().toLowerCase();
            const password = loginForm.password.value;
            
            if (!emailRegex.test(email)) {
                if (loginError) loginError.textContent = 'Введите корректный email';
                return;
            }
            if (!password || password.length < 6) {
                if (loginError) loginError.textContent = 'Пароль должен быть не менее 6 символов';
                return;
            }
            
            const users = getUsers();
            const user = users[email];
            
            if (!user) {
                if (loginError) loginError.textContent = 'Пользователь не найден';
                return;
            }
            
            const hash = await hashPassword(password);
            if (user.passwordHash !== hash) {
                if (loginError) loginError.textContent = 'Неверный пароль';
                return;
            }
            
            setCurrentUser({
                email,
                name: user.name,
                fam: user.fam || '',
                userType: user.userType || 'user',
                company: user.company,
                commission: user.commission,
                createdAt: user.createdAt,
            });
            
            NotificationManager.show('Успешный вход!', 'success');
            SWITCHhref();
            
            setTimeout(() => {
                window.location.href = 'MY_MUSIC.html';
            }, 1000);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (registerError) registerError.textContent = '';
            
            const name = registerForm.name.value.trim();
            const fam = registerForm.fam.value.trim();
            const email = registerForm.email.value.trim().toLowerCase();
            const password = registerForm.password.value;
            
            if (!name) {
                if (registerError) registerError.textContent = 'Введите имя';
                return;
            }
            if (!fam) {
                if (registerError) registerError.textContent = 'Введите фамилию';
                return;
            }
            if (!emailRegex.test(email)) {
                if (registerError) registerError.textContent = 'Введите корректный email';
                return;
            }
            if (!password || password.length < 6) {
                if (registerError) registerError.textContent = 'Пароль должен быть не менее 6 символов';
                return;
            }
            
            const users = getUsers();
            if (users[email]) {
                if (registerError) registerError.textContent = 'Пользователь с таким email уже существует';
                return;
            }
            
            const hash = await hashPassword(password);
            users[email] = {
                name,
                fam,
                passwordHash: hash,
                userType: 'user',
                createdAt: Date.now(),
            };
            
            setUsers(users);
            setCurrentUser({ 
                name, 
                email, 
                fam, 
                userType: 'user',
                createdAt: Date.now(), 
            });
            
            NotificationManager.show('Регистрация успешна! Добро пожаловать!', 'success'); 
            SWITCHhref();
            
            setTimeout(() => {
                window.location.href = 'MY_MUSIC.html';
            }, 1500);
        });
    }
    
    
    const logoutBtnMain = document.getElementById('logoutBtnMain');
    if (logoutBtnMain) {
        logoutBtnMain.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    const logoutFromMenu = document.getElementById('logoutFromMenu');
    if (logoutFromMenu) {
        logoutFromMenu.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

