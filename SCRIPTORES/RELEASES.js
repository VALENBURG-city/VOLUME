// ============================================
// RELEASE MANAGER v1.4 — ЧИСТАЯ ВЕРСИЯ
// CRUD для релизов + NEWREALIZE + MY_MUSIC
// Хранение: Local Storage
// ============================================

// ==================== КОНСТАНТЫ ====================
const STORAGE_KEY = 'releases';

// ==================== УТИЛИТЫ ====================

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function generateUPC() {
    let upc = '';
    for (let i = 0; i < 12; i++) {
        upc += Math.floor(Math.random() * 10);
    }
    return upc;
}

function getTrackWord(count) {
    if (count === 1) return 'трек';
    if (count >= 2 && count <= 4) return 'трека';
    return 'треков';
}

function showNotification(msg, type) {
    const notif = document.getElementById('notification');
    if (!notif) return;
    notif.textContent = msg;
    notif.className = 'notification show ' + type;
    setTimeout(() => { notif.className = 'notification'; }, 4000);
}

// ==================== LOCAL STORAGE API ====================

function getAllReleases() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const releases = data ? JSON.parse(data) : [];
        return Array.isArray(releases) ? releases : [];
    } catch (e) {
        return [];
    }
}

function saveAllReleases(releases) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(releases));
        window.dispatchEvent(new CustomEvent('releasesUpdated'));
    } catch (e) {}
}

function createRelease(releaseData) {
    const releases = getAllReleases();
    
    const newRelease = {
        id: 'rel_' + Date.now(),
        title: releaseData.title || '',
        artist: releaseData.artist || '',
        language: releaseData.language || '',
        genre: releaseData.genre || '',
        label: releaseData.label || '',
        upc: generateUPC(),
        cover: releaseData.cover || '',
        tracks: releaseData.tracks || [],
        platforms: releaseData.platforms || [],
        countries: releaseData.countries || [],
        releaseDate: releaseData.releaseDate || 'immediate',
        customDate: releaseData.customDate || '',
        status: 'draft',
        createdAt: new Date().toISOString()
    };
    
    releases.push(newRelease);
    saveAllReleases(releases);
    return newRelease;
}

function updateRelease(id, releaseData) {
    const releases = getAllReleases();
    const index = releases.findIndex(r => r.id === id);
    if (index === -1) return null;
    releases[index] = { ...releases[index], ...releaseData };
    saveAllReleases(releases);
    return releases[index];
}

function deleteRelease(id) {
    const releases = getAllReleases();
    const index = releases.findIndex(r => r.id === id);
    if (index === -1) return null;
    releases[index].status = 'deleted';
    releases[index].deletedAt = new Date().toISOString();
    saveAllReleases(releases);
    return releases[index];
}

function restoreRelease(id) {
    const releases = getAllReleases();
    const index = releases.findIndex(r => r.id === id);
    if (index === -1) return null;
    releases[index].status = 'draft';
    delete releases[index].deletedAt;
    saveAllReleases(releases);
    return releases[index];
}

function publishRelease(id) {
    const releases = getAllReleases();
    const index = releases.findIndex(r => r.id === id);
    if (index === -1) return null;
    releases[index].status = 'released';
    releases[index].releasedAt = new Date().toISOString();
    saveAllReleases(releases);
    return releases[index];
}

function getReleasesByStatus(status) {
    const releases = getAllReleases();
    if (status === 'all') return releases;
    return releases.filter(r => r.status === status);
}

function searchReleases(query) {
    const releases = getAllReleases();
    if (!query) return releases;
    const q = query.toLowerCase();
    return releases.filter(r => r.title.toLowerCase().includes(q));
}

function getReleaseById(id) {
    const releases = getAllReleases();
    return releases.find(r => r.id === id) || null;
}

// ==================== МОДАЛЬНОЕ ОКНО ====================

class DeleteConfirmModal {
    constructor() {
        this.modalElement = null;
        this.currentReleaseId = null;
        this.currentReleaseTitle = null;
        this.onConfirmCallback = null;
        this.init();
    }

    init() {
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'modal-overlay';
        this.modalElement.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2>Внимание!</h2>
                </div>
                <div class="modal-content">
                    <p>Вы действительно хотите удалить этот релиз?</p>
                    <div class="warning-text">
                        <span>Удалённые релизы можно восстановить в разделе "УДАЛЁННЫЕ"</span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-confirm" id="modalConfirmBtn">УДАЛИТЬ</button>
                    <button class="modal-btn modal-btn-cancel" id="modalCancelBtn">ОТМЕНА</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modalElement);
        
        const cancelBtn = this.modalElement.querySelector('#modalCancelBtn');
        const confirmBtn = this.modalElement.querySelector('#modalConfirmBtn');
        const overlay = this.modalElement;
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirm());
        }
        
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }
    
    show(releaseId, releaseTitle, onConfirm) {
        this.currentReleaseId = releaseId;
        this.currentReleaseTitle = releaseTitle;
        this.onConfirmCallback = onConfirm;
        this.modalElement.classList.add('activEEE');
    }
    
    close() {
        this.modalElement.classList.remove('activEEE');
        this.currentReleaseId = null;
        this.currentReleaseTitle = null;
        this.onConfirmCallback = null;
    }
    
    confirm() {
        if (this.onConfirmCallback && this.currentReleaseId) {
            this.onConfirmCallback(this.currentReleaseId);
        }
        this.close();
    }
    
    isOpen() {
        return this.modalElement.classList.contains('activEEE');
    }
}

let deleteModal = null;

// ==================== СТРАНИЦА NEWREALIZE ====================

function initNewReleasePage() {
    const titleInput       = document.getElementById('releaseTitle');
    const languageSelect   = document.getElementById('releaseLanguage');
    const genreSelect      = document.getElementById('releaseGenre');
    const labelInput       = document.getElementById('releaseLabel');
    const artistInput      = document.getElementById('releaseArtist');
    const platformsSelect  = document.getElementById('releasePlatforms');
    const countriesSelect  = document.getElementById('releaseCountries');
    const customDateTime   = document.getElementById('customDateTime');
    const formMessage      = document.getElementById('formMessage');

    const coverDropZone = document.getElementById('coverDropZone');
    const coverInput    = document.getElementById('coverInput');
    const coverPreview  = document.getElementById('coverPreview');
    let coverBase64 = '';

    if (coverDropZone && coverInput && coverPreview) {
        coverDropZone.addEventListener('click', () => coverInput.click());
        coverDropZone.addEventListener('dragover', (e) => { e.preventDefault(); });
        coverDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleCoverFile(file);
        });
        coverInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleCoverFile(file);
        });
    }

    async function handleCoverFile(file) {
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            showNotification('Неверный формат. Допустимы: PNG, JPG, JPEG', 'error');
            return;
        }
        coverBase64 = await fileToBase64(file);
        
        coverPreview.src = coverBase64;
        coverPreview.style.width = '100%';
        coverPreview.style.height = '100%';
        coverPreview.style.objectFit = 'cover';
        
        const previewIMG = document.getElementById('previewCoverIMG');
        if (previewIMG) {
            previewIMG.src = coverBase64;
            previewIMG.style.width = '100%';
            previewIMG.style.height = '100%';
            previewIMG.style.objectFit = 'cover';
        }
        
        updatePreview();
    }

    let releaseDateMode = 'immediate';
    const dateImmediate = document.getElementById('releaseDateImmediate');
    const dateCustom    = document.getElementById('releaseDateCustom');
    const customDateContainer = document.getElementById('customDateContainer');

    if (dateImmediate && dateCustom) {
        dateImmediate.addEventListener('click', () => switchDateMode('immediate'));
        dateCustom.addEventListener('click', () => switchDateMode('custom'));
    }

    function switchDateMode(mode) {
        releaseDateMode = mode;
        const pointImmediate = dateImmediate.querySelector('.point');
        const pointCustom    = dateCustom.querySelector('.point');
        
        if (mode === 'immediate') {
            if (pointImmediate) pointImmediate.classList.add('activee');
            if (pointCustom) pointCustom.classList.remove('activee');
            if (customDateContainer) customDateContainer.style.display = 'none';
        } else {
            if (pointImmediate) pointImmediate.classList.remove('activee');
            if (pointCustom) pointCustom.classList.add('activee');
            if (customDateContainer) customDateContainer.style.display = 'block';
        }
    }

    let tracks = [];
    const tracklistContainer = document.getElementById('tracklistContainer');
    const addTrackBtn        = document.getElementById('addTrackBtn');

    if (addTrackBtn) {
        addTrackBtn.addEventListener('click', () => addTrack());
    }

    function addTrack(name = '', fileBase64 = '') {
        if (!tracklistContainer) return;
        
        const trackIndex = tracks.length;
        tracks.push({ name, file: fileBase64, duration: 0 });

        const trackRow = document.createElement('div');
        trackRow.className = 'oneROWform';
        trackRow.style.marginBottom = '10px';
        trackRow.dataset.index = trackIndex;
        trackRow.innerHTML = `
            <input type="text" 
                   class="FORMPOLE inputREAL" 
                   style="width: 50%;" 
                   placeholder="Название трека" 
                   value="${escapeHTML(name)}"
                   data-track-field="name"
                   data-index="${trackIndex}">
            <div class="FILEPOLE" style="width: 25%; height: 47px; cursor: pointer;" data-track-field="file">
                ${fileBase64 
                    ? '<p style="color: var(--ACCENT); font-size: 0.8rem; margin: 0; padding: 0;">Загружено</p>' 
                    : '<p style="color: var(--GRAY); font-size: 0.8rem; margin: 0; padding: 0;">+ Аудиофайл</p>'}
                <input type="file" accept="audio/*" style="display: none;" data-track-input="${trackIndex}">
            </div>
            <button type="button" class="BUTTON_INTERNATIONAL" 
                    style="width: 50px; height: 50px; font-size: 0.8rem; border-color: red; background-color: transparent; color: red; flex-shrink: 0;"
                    data-track-remove="${trackIndex}">✕</button>
        `;

        trackRow.querySelector('[data-track-field="name"]').addEventListener('input', (e) => {
            tracks[trackIndex].name = e.target.value;
            updatePreview();
        });

        const fileZone = trackRow.querySelector('[data-track-field="file"]');
        const fileInput = trackRow.querySelector('input[type="file"]');
        fileZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                tracks[trackIndex].file = await fileToBase64(file);
                const p = fileZone.querySelector('p');
                if (p) {
                    p.textContent = 'Загружено';
                    p.style.color = 'var(--ACCENT)';
                }
                updatePreview();
            }
        });

        trackRow.querySelector('[data-track-remove]').addEventListener('click', () => {
            removeTrack(trackIndex);
        });

        tracklistContainer.appendChild(trackRow);
        updatePreview();
    }

    function removeTrack(index) {
        tracks.splice(index, 1);
        renderAllTracks();
        updatePreview();
    }

    function renderAllTracks() {
        const existingTracks = [...tracks];
        if (tracklistContainer) tracklistContainer.innerHTML = '';
        tracks = [];
        existingTracks.forEach(t => addTrack(t.name, t.file));
    }

    function updatePreview() {
        const previewTitle = document.getElementById('previewTitle');
        const previewArtist = document.getElementById('previewArtist');
        const previewTracklist = document.getElementById('previewTracklist');
        
        if (previewTitle) previewTitle.textContent = titleInput ? titleInput.value || 'Введите название' : 'Введите название';
        if (previewArtist) previewArtist.textContent = artistInput ? artistInput.value || 'Исполнитель' : 'Исполнитель';
        
        if (!coverBase64) {
            const previewIMG = document.getElementById('previewCoverIMG');
            if (previewIMG) {
                previewIMG.src = 'MEDIA/ON PAGES/File.png';
                previewIMG.style.width = '80px';
                previewIMG.style.height = 'auto';
                previewIMG.style.objectFit = 'initial';
            }
        }

        if (previewTracklist) {
            if (tracks.length === 0 || tracks.every(t => !t.name)) {
                previewTracklist.innerHTML = '<p style="color: var(--GRAY);">Нет треков</p>';
            } else {
                previewTracklist.innerHTML = tracks
                    .filter(t => t.name)
                    .map((t, i) => `<p style="color: var(--TEXTWHITE); margin: 5px 0;">${i + 1}. ${escapeHTML(t.name)}</p>`)
                    .join('');
            }
        }
    }

    if (titleInput) titleInput.addEventListener('input', updatePreview);
    if (artistInput) artistInput.addEventListener('input', updatePreview);

    const submitBtn = document.getElementById('submitRelease');
    if (submitBtn) {
        submitBtn.removeAttribute('href');
        submitBtn.style.cursor = 'pointer';
        
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        
        newSubmitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (!titleInput.value.trim()) {
                showFormMessage('Укажите название релиза', 'error');
                return false;
            }
            if (!artistInput.value.trim()) {
                showFormMessage('Укажите исполнителя', 'error');
                return false;
            }
            if (tracks.length === 0 || tracks.every(t => !t.name.trim())) {
                showFormMessage('Добавьте хотя бы один трек с названием', 'error');
                return false;
            }

            const releaseData = {
                title: titleInput.value.trim(),
                language: languageSelect ? languageSelect.value : '',
                genre: genreSelect ? genreSelect.value : '',
                label: labelInput ? labelInput.value.trim() : '',
                artist: artistInput.value.trim(),
                cover: coverBase64,
                tracks: tracks.map(t => ({ 
                    name: t.name.trim(), 
                    file: t.file || ''
                })),
                platforms: platformsSelect ? [platformsSelect.value] : ['ALL'],
                countries: countriesSelect ? [countriesSelect.value] : ['ALL'],
                releaseDate: releaseDateMode,
                customDate: releaseDateMode === 'custom' ? (customDateTime ? customDateTime.value : '') : ''
            };

            const newRelease = createRelease(releaseData);
            
            if (newRelease) {
                showFormMessage('РЕЛИЗ СОХРАНЁН В ЧЕРНОВИКИ!', 'success');
                showNotification('Релиз "' + newRelease.title + '" создан', 'success');
                
                setTimeout(() => {
                    resetForm();
                    window.location.href = 'MY_MUSIC.html';
                }, 2000);
            } else {
                showFormMessage('Ошибка при создании релиза', 'error');
            }
            
            return false;
        });
    }

    function showFormMessage(msg, type) {
        if (!formMessage) return;
        formMessage.textContent = msg;
        formMessage.style.color = type === 'success' ? 'var(--ACCENT)' : 'red';
    }

    function resetForm() {
        if (titleInput) titleInput.value = '';
        if (languageSelect) languageSelect.value = '';
        if (genreSelect) genreSelect.value = '';
        if (labelInput) labelInput.value = '';
        if (artistInput) artistInput.value = '';
        coverBase64 = '';
        
        if (coverPreview) {
            coverPreview.src = 'MEDIA/ON PAGES/File.png';
            coverPreview.style.width = '80px';
            coverPreview.style.height = 'auto';
            coverPreview.style.objectFit = 'initial';
        }
        
        const previewIMG = document.getElementById('previewCoverIMG');
        if (previewIMG) {
            previewIMG.src = 'MEDIA/ON PAGES/File.png';
            previewIMG.style.width = '80px';
            previewIMG.style.height = 'auto';
            previewIMG.style.objectFit = 'initial';
        }
        
        if (platformsSelect) platformsSelect.value = 'ALL';
        if (countriesSelect) countriesSelect.value = 'ALL';
        switchDateMode('immediate');
        if (customDateTime) customDateTime.value = '';
        tracks = [];
        if (tracklistContainer) tracklistContainer.innerHTML = '';
        updatePreview();
        if (formMessage) formMessage.textContent = '';
    }

    addTrack();
}

// ==================== СТРАНИЦА MY_MUSIC ====================

function initMyMusicPage() {
    if (!deleteModal) {
        deleteModal = new DeleteConfirmModal();
    }
    
    let currentFilter = 'released';
    const releasesContainer = document.getElementById('releasesContainer');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderReleases();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderReleases();
        });
    }

    function deleteWithConfirm(releaseId, releaseTitle) {
        deleteModal.show(releaseId, releaseTitle, (confirmedId) => {
            deleteRelease(confirmedId);
            showNotification(`Релиз "${releaseTitle}" перемещён в корзину`, 'success');
            renderReleases();
        });
    }

    function publishWithConfirm(releaseId, releaseTitle) {
        publishRelease(releaseId);
        showNotification(`Релиз "${releaseTitle}" опубликован!`, 'success');
        renderReleases();
    }

    function renderReleases() {
        const query = searchInput ? searchInput.value.trim() : '';
        let releases;

        if (query) {
            releases = searchReleases(query);
        } else {
            releases = getReleasesByStatus(currentFilter);
        }

        if (!releasesContainer) return;

        if (releases.length === 0) {
            showEmptyState(query, currentFilter);
            return;
        }

        releasesContainer.innerHTML = releases.map(release => createReleaseCard(release)).join('');
        attachCardListeners();
    }

    function createReleaseCard(release) {
        const validTracks = release.tracks ? release.tracks.filter(t => t.name && t.name.trim()) : [];
        const trackCount = validTracks.length;
        const trackWord = getTrackWord(trackCount);
        const date = release.createdAt ? new Date(release.createdAt).toLocaleDateString('ru-RU') : '?';
        
        const coverHTML = release.cover 
            ? `<img src="${release.cover}" alt="${escapeHTML(release.title)}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<img src="MEDIA/ON PAGES/File.png" style="width: 40px; height: 40px;">`;

        const statusColors = {
            'draft': { color: 'var(--GRAY)', borderColor: 'var(--GRAY)', text: 'ЧЕРНОВИК' },
            'released': { color: 'var(--ACCENT)', borderColor: 'var(--ACCENT)', text: 'ВЫПУЩЕН' },
            'deleted': { color: 'red', borderColor: 'red', text: 'УДАЛЁН' }
        };
        const status = statusColors[release.status] || statusColors['draft'];

        const genreHTML = release.genre ? `<span>${escapeHTML(release.genre)}</span>` : '';
        const languageHTML = release.language ? `<span>${escapeHTML(release.language)}</span>` : '';

        let actionsHTML = '';
        if (release.status === 'draft') {
            actionsHTML = `
                <button class="success" data-action="publish" data-id="${release.id}" data-title="${escapeHTML(release.title)}">ОПУБЛИКОВАТЬ</button>
                <button class="danger" data-action="delete" data-id="${release.id}" data-title="${escapeHTML(release.title)}">УДАЛИТЬ</button>
            `;
        } else if (release.status === 'released') {
            actionsHTML = `
                <button class="danger" data-action="delete" data-id="${release.id}" data-title="${escapeHTML(release.title)}">УДАЛИТЬ</button>
            `;
        } else if (release.status === 'deleted') {
            actionsHTML = `
                <button class="success" data-action="restore" data-id="${release.id}" data-title="${escapeHTML(release.title)}">ВОССТАНОВИТЬ</button>
            `;
        }

        return `
            <div class="release-card" data-id="${release.id}">
                <div class="release-card-cover">${coverHTML}</div>
                <div class="release-card-info">
                    <p class="release-card-title">${escapeHTML(release.title) || 'Без названия'}</p>
                    <p class="release-card-artist">${escapeHTML(release.artist) || 'Неизвестный исполнитель'}</p>
                    <div class="release-card-meta">
                        <span>${trackCount} ${trackWord}</span>
                        ${genreHTML}
                        ${languageHTML}
                        <span>${date}</span>
                    </div>
                </div>
                <span class="release-card-status" style="color: ${status.color}; border: solid 2px ${status.borderColor}; 
                    font-family: CONSOLAS; font-size: 1rem; padding: 6px 12px;">${status.text}
                </span>
                <div class="release-card-actions">${actionsHTML}</div>
            </div>
        `;
    }

    function attachCardListeners() {
        document.querySelectorAll('[data-action]').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = newBtn.dataset.action;
                const id = newBtn.dataset.id;
                const title = newBtn.dataset.title || 'Релиз';
                
                switch (action) {
                    case 'publish':
                        publishWithConfirm(id, title);
                        break;
                    case 'delete':
                        deleteWithConfirm(id, title);
                        break;
                    case 'restore':
                        restoreRelease(id);
                        showNotification(`Релиз "${title}" восстановлен`, 'success');
                        renderReleases();
                        break;
                }
            });
        });
    }

    function showEmptyState(query, filter) {
        let message = 'Нет релизов';
        if (query) {
            message = `По запросу "${escapeHTML(query)}" ничего не найдено`;
        } else if (filter === 'draft') {
            message = 'Нет черновиков';
        } else if (filter === 'deleted') {
            message = 'Нет удалённых релизов';
        } else {
            message = 'Нет выпущенных релизов';
        }

        releasesContainer.innerHTML = `
            <div class="empty-state">
                <p class="text">${message}</p>
                <a href="NEWREALIZE.html" class="text a">СОЗДАТЬ РЕЛИЗ</a>
            </div>
        `;
    }

    renderReleases();
    
    window.addEventListener('releasesUpdated', () => {
        renderReleases();
    });
}

// ==================== ЗАПУСК ====================

document.addEventListener('DOMContentLoaded', () => {
    const isNewRealize = !!document.getElementById('releaseForm');
    const isMyMusic = !!document.getElementById('releasesContainer');
    
    if (isNewRealize) {
        initNewReleasePage();
    }
    
    if (isMyMusic) {
        initMyMusicPage();
    }
});