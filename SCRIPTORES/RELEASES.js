(function() {
    
    const STORAGE_KEYS = {
        RELEASES: 'music_releases',
        NEXT_ID: 'music_next_id',
        DRAFT: 'current_release_draft'
    };

    
    function generateId() {
        let nextId = localStorage.getItem(STORAGE_KEYS.NEXT_ID);
        if (nextId === null) {
            nextId = 1;
        } else {
            nextId = parseInt(nextId) + 1;
        }
        localStorage.setItem(STORAGE_KEYS.NEXT_ID, nextId);
        return nextId;
    }

    
    function generateUPC() {
        let upc = '';
        for (let i = 0; i < 12; i++) {
            upc += Math.floor(Math.random() * 10);
        }
        return upc;
    }

    function getReleases() {
        const releases = localStorage.getItem(STORAGE_KEYS.RELEASES);
        return releases ? JSON.parse(releases) : [];
    }

    function saveReleases(releases) {
        localStorage.setItem(STORAGE_KEYS.RELEASES, JSON.stringify(releases));
        window.dispatchEvent(new CustomEvent('releasesUpdated'));
    }

    function saveRelease(release) {
        const releases = getReleases();
        const existingIndex = releases.findIndex(r => r.id === release.id);
        
        if (existingIndex !== -1) {
            releases[existingIndex] = release;
        } else {
            releases.push(release);
        }
        
        saveReleases(releases);
        return release;
    }

    function deleteReleaseById(id) {
        let releases = getReleases();
        releases = releases.filter(r => r.id !== id);
        saveReleases(releases);
    }

    function softDeleteRelease(id) {
        const releases = getReleases();
        const release = releases.find(r => r.id === id);
        if (release && release.status !== 'deleted') {
            release.status = 'deleted';
            release.deletedAt = new Date().toISOString();
            saveReleases(releases);
        }
    }

    function restoreRelease(id) {
        const releases = getReleases();
        const release = releases.find(r => r.id === id);
        if (release && release.status === 'deleted') {
            release.status = 'released';
            delete release.deletedAt;
            saveReleases(releases);
        }
    }

    function publishRelease(id) {
        const releases = getReleases();
        const release = releases.find(r => r.id === id);
        if (release && release.status === 'draft') {
            release.status = 'released';
            release.releasedAt = new Date().toISOString();
            saveReleases(releases);
        }
    }

    
    function initMyMusicPage() {
        const releasesContainer = document.getElementById('releasesContainer');
        if (!releasesContainer) return;

        function renderReleases() {
            const releases = getReleases();
            const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'released';
            const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';

            let filteredReleases = releases.filter(release => {
                if (activeFilter === 'released') return release.status === 'released';
                if (activeFilter === 'deleted') return release.status === 'deleted';
                if (activeFilter === 'draft') return release.status === 'draft';
                return true;
            });

            if (searchTerm) {
                filteredReleases = filteredReleases.filter(release => 
                    release.title.toLowerCase().includes(searchTerm)
                );
            }

            filteredReleases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            if (filteredReleases.length === 0) {
                releasesContainer.innerHTML = `<div class="empty-state"><p class="text">Нет ${getFilterName(activeFilter)}</p><a href="NEWREALIZE.html" class="a">СОЗДАТЬ РЕЛИЗ</a></div>`;
                return;
            }

            releasesContainer.innerHTML = filteredReleases.map(release => `
                <div class="release-card" data-id="${release.id}" data-status="${release.status}">
                    <div class="release-card-cover">
                        <img src="${release.coverUrl || 'MEDIA/ON PAGES/File.png'}" alt="Обложка">
                    </div>
                    <div class="release-card-info">
                        <h3 class="release-card-title">${escapeHtml(release.title)}</h3>
                        <p class="release-card-artist">${escapeHtml(release.artist)}</p>
                        <div class="release-card-meta">
                            <span>${release.tracks?.length || 0} треков</span>
                            <span>UPC: ${release.upc || '—'}</span>
                            <span>${formatDate(release.createdAt)}</span>
                        </div>
                    </div>
                    <span class="release-card-status ${release.status === 'released' ? 'status-released' : release.status === 'deleted' ? 'status-deleted' : 'status-draft'}">
                        ${release.status === 'released' ? 'ВЫПУЩЕН' : release.status === 'deleted' ? 'УДАЛЁН' : 'ЧЕРНОВИК'}
                    </span>
                    <div class="release-card-actions">
                        ${release.status === 'deleted' ? `
                            <button class="success restore-btn" data-id="${release.id}">ВОССТАНОВИТЬ</button>
                            <button class="danger delete-permanent-btn" data-id="${release.id}">УДАЛИТЬ НАВСЕГДА</button>
                        ` : release.status === 'draft' ? `
                            <button class="success publish-btn" data-id="${release.id}">ОПУБЛИКОВАТЬ</button>
                            <button class="edit-btn" data-id="${release.id}">РЕДАКТИРОВАТЬ</button>
                            <button class="danger delete-btn" data-id="${release.id}">УДАЛИТЬ</button>
                        ` : `
                            <button class="edit-btn" data-id="${release.id}">РЕДАКТИРОВАТЬ</button>
                            <button class="danger delete-btn" data-id="${release.id}">УДАЛИТЬ</button>
                        `}
                    </div>
                </div>
            `).join('');

            attachCardListeners();
        }

        function attachCardListeners() {
            document.querySelectorAll('.restore-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    restoreRelease(id);
                    renderReleases();
                    showNotification('Релиз восстановлен', 'success');
                });
            });

            document.querySelectorAll('.delete-permanent-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    deleteReleaseById(id);
                    renderReleases();
                    showNotification('Релиз удалён навсегда', 'success');
                });
            });

            document.querySelectorAll('.publish-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    publishRelease(id);
                    renderReleases();
                    showNotification('Релиз опубликован!', 'success');
                });
            });

            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    editRelease(id);
                });
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    softDeleteRelease(id);
                    renderReleases();
                    showNotification('Релиз перемещён в удалённые', 'info');
                });
            });
        }

        function getFilterName(filter) {
            const names = { released: 'выпущенных релизов', deleted: 'удалённых релизов', draft: 'черновиков' };
            return names[filter] || 'релизов';
        }

        function editRelease(id) {
            const release = getReleases().find(r => r.id === id);
            if (release) {
                localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(release));
                window.location.href = 'NEWREALIZE.html?edit=' + id;
            }
        }

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderReleases();
            });
        });

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', renderReleases);
        }

        renderReleases();
        
        window.addEventListener('releasesUpdated', () => {
            renderReleases();
        });
    }

    
    function initNewReleasePage() {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        let editReleaseData = null;
        
        if (editId) {
            const releases = getReleases();
            editReleaseData = releases.find(r => r.id == editId);
        }
        
        if (!editReleaseData) {
            const draft = localStorage.getItem(STORAGE_KEYS.DRAFT);
            if (draft) {
                editReleaseData = JSON.parse(draft);
            }
        }

        const elements = {
            title: document.getElementById('releaseTitle'),
            language: document.getElementById('releaseLanguage'),
            genre: document.getElementById('releaseGenre'),
            label: document.getElementById('releaseLabel'),
            artist: document.getElementById('releaseArtist'),
            coverInput: document.getElementById('coverInput'),
            coverDropZone: document.getElementById('coverDropZone'),
            coverPreview: document.getElementById('coverPreview'),
            platforms: document.getElementById('releasePlatforms'),
            countries: document.getElementById('releaseCountries'),
            customDateContainer: document.getElementById('customDateContainer'),
            customDateTime: document.getElementById('customDateTime'),
            submitBtn: document.getElementById('submitRelease'),
            previewTitle: document.getElementById('previewTitle'),
            previewArtist: document.getElementById('previewArtist'),
            previewCoverIMG: document.getElementById('previewCoverIMG'),
            previewTracklist: document.getElementById('previewTracklist'),
            formMessage: document.getElementById('formMessage'),
            tracklistContainer: document.getElementById('tracklistContainer'),
            addTrackBtn: document.getElementById('addTrackBtn')
        };

        let tracks = [];
        let coverBase64 = '';

        
        if (elements.coverDropZone && elements.coverInput) {
            elements.coverDropZone.addEventListener('click', () => elements.coverInput.click());
            elements.coverDropZone.addEventListener('dragover', (e) => e.preventDefault());
            elements.coverDropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleCoverFile(file);
            });
            elements.coverInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) handleCoverFile(file);
            });
        }

        async function handleCoverFile(file) {
            if (!file.type.startsWith('image/')) {
                showNotification('Пожалуйста, загрузите изображение', 'error');
                return;
            }
            coverBase64 = await fileToBase64(file);
            if (elements.coverPreview) {
                elements.coverPreview.src = coverBase64;
                elements.coverPreview.style.objectFit = 'cover';
            }
            if (elements.previewCoverIMG) {
                elements.previewCoverIMG.src = coverBase64;
            }
            updatePreview();
        }

        
        function addTrack(trackData = null) {
            const trackId = Date.now() + '_' + Math.random();
            const trackIndex = tracks.length;
            
            tracks.push({
                id: trackId,
                name: trackData?.name || '',
                feat: trackData?.feat || '',
                audioFile: trackData?.audioFile || '',
                audioName: trackData?.audioName || ''
            });

            const trackDiv = document.createElement('div');
            trackDiv.className = 'track-item oneROWform';
            trackDiv.dataset.id = trackId;
            trackDiv.innerHTML = `
                <input type="text" class="track-name FORMPOLE cut inputREAL" style="width: 50%; height: 47px;" placeholder="Название трека" value="${escapeHtml(tracks[trackIndex].name)}">
                <div class="track-audio-zone" data-track-id="${trackId}" style="width: 25%;">
                    <div class="audio-upload-btn inputREAL FORMPOLE" style="width: 100%; height: 47px; cursor: pointer; color: var(--GRAY); display: flex; align-items: center; justify-content: center;">
                        ${tracks[trackIndex].audioFile ? 'ЗАГРУЖЕНО' : 'ЗАГРУЗИТЬ ТРЕК'}
                    </div>
                    <input type="file" class="audio-input" accept="audio/*" style="display: none;">
                </div>
                <button type="button" style="width: 50px; height: 47px; font-size: 0.8rem; border-color: red; background-color: transparent; color: red; flex-shrink: 0; cursor: pointer;" class="track-delete-btn">✕</button>
            `;

            
            const nameInput = trackDiv.querySelector('.track-name');
            nameInput.addEventListener('input', (e) => {
                tracks[trackIndex].name = e.target.value;
                updatePreview();
            });

            
            const audioZone = trackDiv.querySelector('.track-audio-zone');
            const audioInput = trackDiv.querySelector('.audio-input');
            const audioBtn = trackDiv.querySelector('.audio-upload-btn');
            
            audioZone.addEventListener('click', (e) => {
                e.stopPropagation();
                audioInput.click();
            });
            
            audioInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('audio/')) {
                    tracks[trackIndex].audioFile = await fileToBase64(file);
                    tracks[trackIndex].audioName = file.name;
                    audioBtn.textContent = 'ЗАГРУЖЕНО';
                    showNotification(`Аудио "${file.name}" загружено`, 'success');
                } else {
                    showNotification('Пожалуйста, загрузите аудиофайл', 'error');
                }
            });

            
            const deleteBtn = trackDiv.querySelector('.track-delete-btn');
            deleteBtn.addEventListener('click', () => {
                tracks.splice(trackIndex, 1);
                renderAllTracks();
                updatePreview();
            });

            if (elements.tracklistContainer) {
                elements.tracklistContainer.appendChild(trackDiv);
            }
            
            updatePreview();
        }

        function renderAllTracks() {
            if (!elements.tracklistContainer) return;
            const currentTracks = [...tracks];
            elements.tracklistContainer.innerHTML = '';
            tracks = [];
            currentTracks.forEach(track => addTrack(track));
        }

        function updatePreview() {
            if (elements.previewTitle) {
                elements.previewTitle.textContent = elements.title?.value.trim() || 'Введите название';
            }
            if (elements.previewArtist) {
                elements.previewArtist.textContent = elements.artist?.value.trim() || 'Исполнитель';
            }
            if (elements.previewTracklist) {
                const validTracks = tracks.filter(t => t.name.trim());
                if (validTracks.length === 0) {
                    elements.previewTracklist.innerHTML = '<p style="color: var(--GRAY);">Нет треков</p>';
                } else {
                    elements.previewTracklist.innerHTML = validTracks.map((track, idx) => `
                        <div class="preview-track">
                            <span class="track-num">${idx + 1}.</span>
                            <span class="track-name-preview">${escapeHtml(track.name)}</span>
                            ${track.feat ? `<span class="track-feat-preview">(ft. ${escapeHtml(track.feat)})</span>` : ''}
                            ${track.audioFile ? '<span class="audio-indicator"></span>' : '<span class="audio-indicator missing"></span>'}
                        </div>
                    `).join('');
                }
            }
        }

        
        async function handleSubmit(e) {
            e.preventDefault();
            
            if (!elements.title?.value.trim()) {
                showFormMessage('Укажите название релиза', 'error');
                return;
            }
            if (!elements.artist?.value.trim()) {
                showFormMessage('Укажите исполнителя', 'error');
                return;
            }
            
            const validTracks = tracks.filter(t => t.name.trim());
            if (validTracks.length === 0) {
                showFormMessage('Добавьте хотя бы один трек с названием', 'error');
                return;
            }
            
            const releaseData = {
                id: editReleaseData ? editReleaseData.id : generateId(),
                upc: editReleaseData ? editReleaseData.upc : generateUPC(),
                title: elements.title.value.trim(),
                language: elements.language?.value || '',
                genre: elements.genre?.value || '',
                label: elements.label?.value || '',
                artist: elements.artist.value.trim(),
                coverUrl: coverBase64 || elements.coverPreview?.src || 'MEDIA/ON PAGES/File.png',
                platforms: elements.platforms?.value || 'ALL',
                countries: elements.countries?.value || 'ALL',
                releaseMode: releaseMode,
                customDate: releaseMode === 'custom' ? elements.customDateTime?.value : null,
                tracks: validTracks.map((t, idx) => ({
                    number: idx + 1,
                    name: t.name.trim(),
                    feat: t.feat?.trim() || '',
                    audioFile: t.audioFile || '',
                    audioName: t.audioName || ''
                })),
                status: editReleaseData ? editReleaseData.status : 'draft',
                createdAt: editReleaseData ? editReleaseData.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            saveRelease(releaseData);
            localStorage.removeItem(STORAGE_KEYS.DRAFT);
            
            showFormMessage(`Релиз "${releaseData.title}" сохранён! UPC: ${releaseData.upc}`, 'success');
            
            setTimeout(() => {
                window.location.href = 'MY_MUSIC.html';
            }, 2000);
        }

        function showFormMessage(msg, type) {
            if (elements.formMessage) {
                elements.formMessage.textContent = msg;
                elements.formMessage.style.color = type === 'error' ? 'red' : '#00ff88';
                setTimeout(() => {
                    elements.formMessage.textContent = '';
                }, 3000);
            }
        }

        
        const immediateBlock = document.getElementById('releaseDateImmediate');
        const customBlock = document.getElementById('releaseDateCustom');
        let releaseMode = 'immediate';

        if (immediateBlock) {
            immediateBlock.addEventListener('click', () => {
                document.querySelectorAll('.point').forEach(p => p.classList.remove('activee'));
                immediateBlock.querySelector('.point')?.classList.add('activee');
                releaseMode = 'immediate';
                if (elements.customDateContainer) elements.customDateContainer.style.display = 'none';
            });
        }

        if (customBlock) {
            customBlock.addEventListener('click', () => {
                document.querySelectorAll('.point').forEach(p => p.classList.remove('activee'));
                customBlock.querySelector('.point')?.classList.add('activee');
                releaseMode = 'custom';
                if (elements.customDateContainer) elements.customDateContainer.style.display = 'block';
            });
        }

        
        if (editReleaseData) {
            if (elements.title) elements.title.value = editReleaseData.title || '';
            if (elements.language) elements.language.value = editReleaseData.language || '';
            if (elements.genre) elements.genre.value = editReleaseData.genre || '';
            if (elements.label) elements.label.value = editReleaseData.label || '';
            if (elements.artist) elements.artist.value = editReleaseData.artist || '';
            if (elements.platforms) elements.platforms.value = editReleaseData.platforms || 'ALL';
            if (elements.countries) elements.countries.value = editReleaseData.countries || 'ALL';
            
            if (editReleaseData.coverUrl && elements.coverPreview) {
                coverBase64 = editReleaseData.coverUrl;
                elements.coverPreview.src = editReleaseData.coverUrl;
                if (elements.previewCoverIMG) elements.previewCoverIMG.src = editReleaseData.coverUrl;
            }
            
            if (editReleaseData.tracks && editReleaseData.tracks.length) {
                tracks = [];
                editReleaseData.tracks.forEach(track => {
                    tracks.push({
                        id: Date.now() + '_' + Math.random(),
                        name: track.name || '',
                        feat: track.feat || '',
                        audioFile: track.audioFile || '',
                        audioName: track.audioName || ''
                    });
                });
                setTimeout(() => renderAllTracks(), 0);
            }
            
            if (editReleaseData.releaseMode === 'custom' && editReleaseData.customDate) {
                releaseMode = 'custom';
                if (elements.customDateContainer) elements.customDateContainer.style.display = 'block';
                if (elements.customDateTime) elements.customDateTime.value = editReleaseData.customDate;
                customBlock?.querySelector('.point')?.classList.add('activee');
            } else {
                immediateBlock?.querySelector('.point')?.classList.add('activee');
            }
        }

        
        if (!editReleaseData || !editReleaseData.tracks?.length) {
            addTrack();
        }

        if (elements.addTrackBtn) {
            elements.addTrackBtn.addEventListener('click', () => addTrack());
        }

        if (elements.submitBtn) {
            elements.submitBtn.addEventListener('click', handleSubmit);
        }

        if (elements.title) elements.title.addEventListener('input', updatePreview);
        if (elements.artist) elements.artist.addEventListener('input', updatePreview);
        
        updatePreview();
    }

    
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function formatDate(dateString) {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification show ${type}`;
            setTimeout(() => {
                notification.className = 'notification';
            }, 3000);
        }
    }

    
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('MY_MUSIC.html') || 
            window.location.pathname.endsWith('MY_MUSIC')) {
            initMyMusicPage();
        } else if (window.location.pathname.includes('NEWREALIZE.html') || 
                   window.location.pathname.endsWith('NEWREALIZE')) {
            initNewReleasePage();
        }
    });
})();