(function() {
    let currentUser = {
        name: 'Артист',
        email: 'artist@example.com',
        avatar: '/MEDIA/forHEADER/soviet olymp bear boxing.jpg'
    };
    
    function updateHeaderAvatar(avatarUrl) {
        const headerAvatar = document.querySelector('.AVATAR');
        if (headerAvatar) {
            headerAvatar.src = avatarUrl;
        } else {
            const observer = new MutationObserver(() => {
                const headerAvatarRetry = document.querySelector('.AVATAR');
                if (headerAvatarRetry) {
                    headerAvatarRetry.src = avatarUrl;
                    observer.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            
            setTimeout(() => observer.disconnect(), 3000);
        }
    }
    
    function loadProfileFromStorage() {
        const saved = localStorage.getItem('music_distributor_profile');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                currentUser.name = parsed.name || 'Артист';
                currentUser.email = parsed.email || 'artist@example.com';
                currentUser.avatar = parsed.avatar || '/MEDIA/forHEADER/soviet olymp bear boxing.jpg';
            } catch(e) {}
        }
        
        const displayName = document.getElementById('displayName');
        const displayEmail = document.getElementById('displayEmail');
        const avatarImg = document.getElementById('profileAvatar');
        const editName = document.getElementById('editName');
        const editEmail = document.getElementById('editEmail');
        
        if (displayName) displayName.innerText = currentUser.name;
        if (displayEmail) displayEmail.innerText = currentUser.email;
        if (avatarImg) avatarImg.src = currentUser.avatar;
        if (editName) editName.value = currentUser.name;
        if (editEmail) editEmail.value = currentUser.email;
        
        updateHeaderAvatar(currentUser.avatar);
    }
    
    function saveProfileToStorage() {
        localStorage.setItem('music_distributor_profile', JSON.stringify(currentUser));
        updateHeaderAvatar(currentUser.avatar);
    }
    
    function showMessage(elementId, text, type) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.innerHTML = text;
        el.style.color = type === 'error' ? '#ff8888' : (type === 'success' ? '#2BFF00' : '#cccccc');
        setTimeout(() => {
            if (el) el.innerHTML = '';
        }, 3500);
    }
    
    function showGlobalNotification(msg) {
        let notif = document.getElementById('notification');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'notification';
            notif.className = 'notification';
            document.body.appendChild(notif);
        }
        notif.innerText = msg;
        notif.classList.add('show');
        setTimeout(() => {
            notif.classList.remove('show');
        }, 3000);
    }
    
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', function() {
            const newName = document.getElementById('editName');
            const newEmail = document.getElementById('editEmail');
            
            if (!newName || !newEmail) return;
            
            const nameValue = newName.value.trim();
            const emailValue = newEmail.value.trim();
            
            if (!nameValue) {
                showMessage('profileMessage', 'Имя не может быть пустым', 'error');
                return;
            }
            if (!emailValue || !emailValue.includes('@')) {
                showMessage('profileMessage', 'Введите корректный email', 'error');
                return;
            }
            
            currentUser.name = nameValue;
            currentUser.email = emailValue;
            saveProfileToStorage();
            
            const displayName = document.getElementById('displayName');
            const displayEmail = document.getElementById('displayEmail');
            const profileAvatar = document.getElementById('profileAvatar');
            
            if (displayName) displayName.innerText = currentUser.name;
            if (displayEmail) displayEmail.innerText = currentUser.email;
            if (profileAvatar) profileAvatar.src = currentUser.avatar;
            
            showMessage('profileMessage', 'Профиль успешно обновлён', 'success');
            showGlobalNotification('Изменения сохранены');
        });
    }
    
    const avatarInput = document.getElementById('avatarInput');
    const previewImg = document.getElementById('avatarPreview');
    
    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64 = event.target.result;
                    currentUser.avatar = base64;
                    if (previewImg) {
                        previewImg.style.display = 'inline-block';
                        previewImg.src = base64;
                        previewImg.style.width = '80px';
                        previewImg.style.height = '80px';
                    }
                    showMessage('profileMessage', 'Аватар выбран, не забудьте сохранить', 'info');
                };
                reader.readAsDataURL(file);
            } else {
                showMessage('profileMessage', 'Поддерживаются только PNG/JPG', 'error');
            }
        });
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay';
            modalOverlay.innerHTML = `
                <div class="modal-container">
                    <div class="modal-header">
                        <h2 style="color: var(--ACCENT);">ВЫХОД</h2>
                    </div>
                    <div class="modal-content">
                        <p>Вы действительно хотите выйти из аккаунта?</p>
                        <p class="warning-text">Все несохранённые изменения будут потеряны.</p>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn modal-btn-cancel" id="cancelLogout">ОТМЕНА</button>
                        <button class="modal-btn modal-btn-confirm" id="confirmLogout">ВЫЙТИ</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modalOverlay);
            setTimeout(() => modalOverlay.classList.add('active'), 10);
            
            const closeModal = () => {
                modalOverlay.classList.remove('active');
                setTimeout(() => modalOverlay.remove(), 300);
            };
            
            const cancelBtn = document.getElementById('cancelLogout');
            const confirmBtn = document.getElementById('confirmLogout');
            
            if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    showGlobalNotification('Вы вышли из системы. Перенаправление...');
                    setTimeout(() => {
                        window.location.href = 'STARTPAD.html';
                    }, 1000);
                    closeModal();
                });
            }
        });
    }
    
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay';
            modalOverlay.innerHTML = `
                <div class="modal-container">
                    <div class="modal-header">
                        <h2 style="color: red;">УДАЛЕНИЕ АККАУНТА</h2>
                    </div>
                    <div class="modal-content">
                        <p><strong>Это действие необратимо.</strong> Все ваши релизы, статистика и данные будут удалены без возможности восстановления.</p>
                        <p class="warning-text">Введите слово <span style="color: var(--ACCENT);">УДАЛИТЬ</span> для подтверждения:</p>
                        <input type="text" id="deleteConfirmInput" style="background:transparent; border: var(--BORDER_GRAY); color: white; padding: 8px; width: 100%; margin-top: 10px; font-family: CONSOLAS;">
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn modal-btn-cancel" id="cancelDelete">ОТМЕНА</button>
                        <button class="modal-btn modal-btn-confirm" id="confirmDelete" style="background: red;">УДАЛИТЬ НАВСЕГДА</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modalOverlay);
            setTimeout(() => modalOverlay.classList.add('active'), 10);
            
            const closeModal = () => {
                modalOverlay.classList.remove('active');
                setTimeout(() => modalOverlay.remove(), 300);
            };
            
            const cancelBtn = document.getElementById('cancelDelete');
            if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
            
            const confirmBtn = document.getElementById('confirmDelete');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    const inputField = document.getElementById('deleteConfirmInput');
                    if (inputField && inputField.value === 'УДАЛИТЬ') {
                        localStorage.removeItem('music_distributor_profile');
                        localStorage.removeItem('userReleases');
                        showGlobalNotification('Аккаунт удалён. Все данные стёрты.');
                        setTimeout(() => {
                            window.location.href = 'STARTPAD.html';
                        }, 1500);
                        closeModal();
                    } else {
                        const errDiv = document.createElement('div');
                        errDiv.style.color = 'red';
                        errDiv.style.fontFamily = 'CONSOLAS';
                        errDiv.style.fontSize = '0.8rem';
                        errDiv.innerText = 'Неверное подтверждающее слово.';
                        if (!document.querySelector('.modal-content .error-msg')) {
                            const content = modalOverlay.querySelector('.modal-content');
                            if (content) {
                                errDiv.classList.add('error-msg');
                                content.appendChild(errDiv);
                            }
                        }
                    }
                });
            }
        });
    }
    
    loadProfileFromStorage();
    
    if (!localStorage.getItem('music_distributor_profile')) {
        saveProfileToStorage();
    }
})();