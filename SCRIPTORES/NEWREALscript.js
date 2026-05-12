// ============================================
// RELEASE MANAGER v1.0
// CRUD для релизов + логика страницы NEWREALIZE
// Хранение: Local Storage
// ============================================

// ==================== КОНСТАНТЫ ====================
const STORAGE_KEY = 'releases';

// ==================== LOCAL STORAGE API ====================

function getAllReleases() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveAllReleases(releases) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(releases));
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
        upc: releaseData.upc || '',
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

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ==================== ЛОГИКА СТРАНИЦЫ NEWREALIZE ====================

document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, находимся ли мы на странице NEWREALIZE
    if (!document.getElementById('releaseForm')) return;

    initNewReleasePage();
});

function initNewReleasePage() {
    // ---- ЭЛЕМЕНТЫ ФОРМЫ ----
    const titleInput       = document.getElementById('releaseTitle');
    const languageSelect   = document.getElementById('releaseLanguage');
    const genreSelect      = document.getElementById('releaseGenre');
    const labelInput       = document.getElementById('releaseLabel');
    const upcInput         = document.getElementById('releaseUPC');
    const artistInput      = document.getElementById('releaseArtist');
    const platformsSelect  = document.getElementById('releasePlatforms');
    const countriesSelect  = document.getElementById('releaseCountries');
    const customDateTime   = document.getElementById('customDateTime');
    const formMessage      = document.getElementById('formMessage');

    // ---- ОБЛОЖКА ----
    const coverDropZone = document.getElementById('coverDropZone');
    const coverInput    = document.getElementById('coverInput');
    const coverPreview  = document.getElementById('coverPreview');
    let coverBase64 = '';

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

    async function handleCoverFile(file) {
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            showNotification('Неверный формат. Допустимы: PNG, JPG, JPEG', 'error');
            return;
        }
        coverBase64 = await fileToBase64(file);
        
        // Маленькое превью в зоне загрузки
        coverPreview.src = coverBase64;
        coverPreview.style.width = '100%';
        coverPreview.style.height = '100%';
        coverPreview.style.objectFit = 'cover';
        
        // Большое превью в «Обзоре»
        const previewIMG = document.getElementById('previewCoverIMG');
        previewIMG.src = coverBase64;
        previewIMG.style.width = '100%';
        previewIMG.style.height = '100%';
        previewIMG.style.objectFit = 'cover';
        
        updatePreview();
    }

    // ---- ДАТА РЕЛИЗА ----
    let releaseDateMode = 'immediate';
    const dateImmediate = document.getElementById('releaseDateImmediate');
    const dateCustom    = document.getElementById('releaseDateCustom');
    const customDateContainer = document.getElementById('customDateContainer');

    dateImmediate.addEventListener('click', () => switchDateMode('immediate'));
    dateCustom.addEventListener('click', () => switchDateMode('custom'));

    function switchDateMode(mode) {
        releaseDateMode = mode;
        const pointImmediate = dateImmediate.querySelector('.point');
        const pointCustom    = dateCustom.querySelector('.point');
        
        if (mode === 'immediate') {
            pointImmediate.classList.add('activee');
            pointCustom.classList.remove('activee');
            customDateContainer.style.display = 'none';
        } else {
            pointImmediate.classList.remove('activee');
            pointCustom.classList.add('activee');
            customDateContainer.style.display = 'block';
        }
    }

    // ---- ТРЕКЛИСТ ----
    let tracks = [];
    const tracklistContainer = document.getElementById('tracklistContainer');
    const addTrackBtn        = document.getElementById('addTrackBtn');

    addTrackBtn.addEventListener('click', () => addTrack());

    function addTrack(name = '', fileBase64 = '') {
        const trackIndex = tracks.length;
        tracks.push({ name, file: fileBase64, duration: 0 });

        const trackRow = document.createElement('div');
        trackRow.className = 'oneROWform';
        trackRow.style.marginBottom = '10px';
        trackRow.dataset.index = trackIndex;
        trackRow.innerHTML = `
            <input type="text" 
                   class="FORMPOLE inputREAL" 
                   style="width: 60%;" 
                   placeholder="Название трека" 
                   value="${escapeHTML(name)}"
                   data-track-field="name"
                   data-index="${trackIndex}">
            <div class="FILEPOLE" style="width: 25%; height: 50px; cursor: pointer; position: relative;" data-track-field="file">
                ${fileBase64 
                    ? '<p style="color: var(--ACCENT); font-size: 0.8rem;">Загружено</p>' 
                    : '<p style="color: var(--GRAY); font-size: 0.8rem;">+ Аудиофайл</p>'}
                <input type="file" accept="audio/*" style="display: none;" data-track-input="${trackIndex}">
            </div>
            <button type="button" class="BUTTON_INTERNATIONAL" 
                    style="width: 40px; height: 40px; font-size: 0.8rem; border-color: red; color: red;"
                    data-track-remove="${trackIndex}">
                ✕
            </button>
        `;

        // Обработчик названия трека
        trackRow.querySelector('[data-track-field="name"]').addEventListener('input', (e) => {
            tracks[trackIndex].name = e.target.value;
            updatePreview();
        });

        // Обработчик загрузки аудио
        const fileZone = trackRow.querySelector('[data-track-field="file"]');
        const fileInput = trackRow.querySelector('input[type="file"]');
        fileZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                tracks[trackIndex].file = await fileToBase64(file);
                tracks[trackIndex].fileName = file.name;
                fileZone.querySelector('p').textContent = 'Загружено';
                fileZone.querySelector('p').style.color = 'var(--ACCENT)';
                updatePreview();
            }
        });

        // Обработчик удаления трека
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
        tracklistContainer.innerHTML = '';
        tracks = [];
        existingTracks.forEach(t => addTrack(t.name, t.file));
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---- ПРЕВЬЮ ----
    function updatePreview() {
        document.getElementById('previewTitle').textContent = titleInput.value || 'Введите название';
        document.getElementById('previewArtist').textContent = artistInput.value || 'Исполнитель';
        
        // Если обложка не загружена — показываем иконку File.png
        if (!coverBase64) {
            const previewIMG = document.getElementById('previewCoverIMG');
            previewIMG.src = 'MEDIA/ON PAGES/File.png';
            previewIMG.style.width = '80px';
            previewIMG.style.height = 'auto';
            previewIMG.style.objectFit = 'initial';
        }

        const previewTracklist = document.getElementById('previewTracklist');
        if (tracks.length === 0 || tracks.every(t => !t.name)) {
            previewTracklist.innerHTML = '<p style="color: var(--GRAY);">Нет треков</p>';
        } else {
            previewTracklist.innerHTML = tracks
                .filter(t => t.name)
                .map((t, i) => `<p style="color: var(--TEXTWHITE); margin: 5px 0;">${i + 1}. ${escapeHTML(t.name)}</p>`)
                .join('');
        }
    }

    // Обработчики для превью
    titleInput.addEventListener('input', updatePreview);
    artistInput.addEventListener('input', updatePreview);

    // ---- ОТПРАВКА ФОРМЫ ----
    document.getElementById('submitRelease').addEventListener('click', () => {
        // Валидация
        if (!titleInput.value.trim()) {
            showFormMessage('Укажите название релиза', 'error');
            return;
        }
        if (!artistInput.value.trim()) {
            showFormMessage('Укажите исполнителя', 'error');
            return;
        }
        if (tracks.length === 0 || tracks.every(t => !t.name.trim())) {
            showFormMessage('Добавьте хотя бы один трек', 'error');
            return;
        }

        // Сбор данных
        const releaseData = {
            title: titleInput.value.trim(),
            language: languageSelect.value,
            genre: genreSelect.value,
            label: labelInput.value.trim(),
            upc: upcInput.value.trim(),
            artist: artistInput.value.trim(),
            cover: coverBase64,
            tracks: tracks.map(t => ({ 
                name: t.name.trim(), 
                file: t.file, 
                fileName: t.fileName || '' 
            })),
            platforms: Array.from(platformsSelect.selectedOptions).map(o => o.value),
            countries: Array.from(countriesSelect.selectedOptions).map(o => o.value),
            releaseDate: releaseDateMode,
            customDate: releaseDateMode === 'custom' ? customDateTime.value : ''
        };

        const newRelease = createRelease(releaseData);

        showFormMessage('РЕЛИЗ СОХРАНЁН!', 'success');
        showNotification('Релиз "' + newRelease.title + '" создан', 'success');

        // Очистка формы через 1.5 секунды
        setTimeout(() => {
            resetForm();
        }, 1500);
    });

    function showFormMessage(msg, type) {
        formMessage.textContent = msg;
        formMessage.style.color = type === 'success' ? 'var(--ACCENT)' : 'red';
        setTimeout(() => { formMessage.textContent = ''; }, 3000);
    }

    function resetForm() {
        titleInput.value = '';
        languageSelect.value = '';
        genreSelect.value = '';
        labelInput.value = '';
        upcInput.value = '';
        artistInput.value = '';
        coverBase64 = '';
        
        // Маленькое превью
        coverPreview.src = 'MEDIA/ON PAGES/File.png';
        coverPreview.style.width = '80px';
        coverPreview.style.height = 'auto';
        coverPreview.style.objectFit = 'initial';
        
        // Большое превью
        const previewIMG = document.getElementById('previewCoverIMG');
        previewIMG.src = 'MEDIA/ON PAGES/File.png';
        previewIMG.style.width = '80px';
        previewIMG.style.height = 'auto';
        previewIMG.style.objectFit = 'initial';
        
        platformsSelect.selectedIndex = -1;
        countriesSelect.value = 'ALL';
        switchDateMode('immediate');
        customDateTime.value = '';
        tracks = [];
        tracklistContainer.innerHTML = '';
        updatePreview();
        formMessage.textContent = '';
    }

    // ---- УВЕДОМЛЕНИЯ ----
    function showNotification(msg, type) {
        const notif = document.getElementById('notification');
        if (!notif) return;
        notif.textContent = msg;
        notif.className = 'notification show ' + type;
        setTimeout(() => { notif.className = 'notification'; }, 3000);
    }

    // ---- ИНИЦИАЛИЗАЦИЯ ----
    addTrack(); // Один пустой трек по умолчанию
}

// Функция генерации случайного UPC
function generateUPC() {
    // Генерируем 12-значный код
    let upc = '';
    for (let i = 0; i < 12; i++) {
        upc += Math.floor(Math.random() * 10);
    }
    return upc;
}

// Функция создания релиза — убираем releaseData.upc из параметров
function createRelease(releaseData) {
    const releases = getAllReleases();
    const newRelease = {
        id: 'rel_' + Date.now(),
        title: releaseData.title || '',
        artist: releaseData.artist || '',
        language: releaseData.language || '',
        genre: releaseData.genre || '',
        label: releaseData.label || '',
        upc: generateUPC(), // Генерируется системой, а не пользователем!
        cover: releaseData.cover || '',
        tracks: releaseData.tracks || [],
        // ... остальные поля
    };
    releases.push(newRelease);
    saveAllReleases(releases);
    return newRelease;
}