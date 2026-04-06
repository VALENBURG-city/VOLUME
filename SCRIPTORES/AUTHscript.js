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
        window.location.href = 'MAIN_MENU.html';
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

function loadPartnerData() {
    const user = getCurrentUser();
    
    if (!user || user.userType !== 'partner') return;
    
    const partnerSection = document.getElementById('partnerSection');
    const partnerBadge = document.getElementById('partnerBadge');
    const partnerCompany = document.getElementById('partnerCompany');
    const partnerLink = document.getElementById('partnerLink');
    const partnerClicks = document.getElementById('partnerClicks');
    const partnerConversions = document.getElementById('partnerConversions');
    const partnerEarnings = document.getElementById('partnerEarnings');
    const partnerCommission = document.getElementById('partnerCommission');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    
    if (partnerSection) partnerSection.classList.remove('hidden');
    if (partnerBadge) partnerBadge.classList.remove('hidden');
    
    if (partnerCompany && user.company) {
        partnerCompany.value = user.company;
    }
    
    if (partnerLink && user.partnerLink) {
        partnerLink.textContent = user.partnerLink;
    }
    
    const stats = user.partnerStats || { clicks: 0, conversions: 0, earnings: 0 };
    if (partnerClicks) partnerClicks.textContent = stats.clicks || 0;
    if (partnerConversions) partnerConversions.textContent = stats.conversions || 0;
    if (partnerEarnings) partnerEarnings.textContent = `$${stats.earnings || 0}`;
    
    const commission = user.commission || 30;
    if (partnerCommission) {
        partnerCommission.textContent = commission === 'negotiable' ? 'Договорная' : commission + '%';
    }
    
    if (copyLinkBtn && partnerLink) {
        copyLinkBtn.addEventListener('click', function() {
            const link = partnerLink.textContent;
            navigator.clipboard.writeText(link).then(() => {
                NotificationManager.show('Ссылка скопирована!', 'success');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    SWITCHhref();
    
    if (document.getElementById('nameDATA') || document.getElementById('infoFam')) {
        loadUserProfileData();
        loadPartnerData();
    }
    
    const tabs = document.querySelectorAll('.AUTHtabBTN');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const partnerForm = document.getElementById('partner-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const partnerError = document.getElementById('partner-error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (tabs.length) {
        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                tabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.dataset.tab;
                
                if (loginForm) loginForm.classList.add('hidden');
                if (registerForm) registerForm.classList.add('hidden');
                if (partnerForm) partnerForm.classList.add('hidden');
                
                if (tab === 'login') {
                    if (loginForm) loginForm.classList.remove('hidden');
                } else if (tab === 'register') {
                    if (registerForm) registerForm.classList.remove('hidden');
                } else if (tab === 'partner') {
                    if (partnerForm) partnerForm.classList.remove('hidden');
                }
                
                if (loginError) loginError.textContent = '';
                if (registerError) registerError.textContent = '';
                if (partnerError) partnerError.textContent = '';
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
                partnerLink: user.partnerLink,
                partnerStats: user.partnerStats,
                commission: user.commission,
                createdAt: user.createdAt,
            });
            
            NotificationManager.show('Успешный вход!', 'success');
            SWITCHhref();
            
            setTimeout(() => {
                window.location.href = 'MAIN_MENU.html';
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
                window.location.href = 'MAIN_MENU.html';
            }, 1500);
        });
    }
    
    if (partnerForm) {
        partnerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (partnerError) partnerError.textContent = '';
            
            const company = partnerForm.company.value.trim();
            const fam = partnerForm.fam.value.trim();
            const name = partnerForm.name.value.trim();
            const email = partnerForm.email.value.trim().toLowerCase();
            const password = partnerForm.password.value;
            
            if (!company) {
                if (partnerError) partnerError.textContent = 'Введите название компании или сайт';
                return;
            }
            if (!name) {
                if (partnerError) partnerError.textContent = 'Введите имя';
                return;
            }
            
            if (!fam) {
                if (partnerError) partnerError.textContent = 'Введите фамилию';
                return;
            }

            if (!emailRegex.test(email)) {
                if (partnerError) partnerError.textContent = 'Введите корректный email';
                return;
            }
            if (!password || password.length < 6) {
                if (partnerError) partnerError.textContent = 'Пароль должен быть не менее 6 символов';
                return;
            }
            
            const users = getUsers();
            if (users[email]) {
                if (partnerError) partnerError.textContent = 'Пользователь с таким email уже существует';
                return;
            }
            
            const hash = await hashPassword(password);
            
            const partnerLink = `https://semanticsummarizer.ai/ref/${btoa(email).substring(0, 10)}`;
            
            users[email] = {
                name,
                fam,
                company,
                email,
                passwordHash: hash,
                userType: 'partner',
                partnerLink: partnerLink,  
                commission: 30,
                createdAt: Date.now(),
                partnerStats: {
                    clicks: 0,
                    conversions: 0,
                    earnings: 0
                }
            };
            
            setUsers(users);
            setCurrentUser({ 
                name,
                fam,
                email, 
                company,
                userType: 'partner',
                partnerLink: partnerLink,
                commission: 30,
                partnerStats: {
                    clicks: 0,
                    conversions: 0,
                    earnings: 0
                },
                createdAt: Date.now() 
            });
            
            NotificationManager.show('Вы зарегистрированы как Партнёр!', 'success');
            SWITCHhref();
            
            setTimeout(() => {
                window.location.href = 'MAIN_MENU.html';
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