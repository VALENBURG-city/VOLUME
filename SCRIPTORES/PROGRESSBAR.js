// PROGRESSBAR.js - скрипт для отслеживания заполнения формы

class FormProgressBar {
    constructor(config = {}) {
        this.formId = config.formId || 'releaseForm';
        this.fields = config.fields || [];
        this.updateThreshold = config.updateThreshold || 100;
        this.onComplete = config.onComplete || null;
        
        this.container = null;
        this.fillElement = null;
        this.lastProgress = 0;
        
        this.init();
    }
    
    init() {
        // Создаем контейнер для прогресс-бара
        this.container = document.createElement('div');
        this.container.className = 'progress-bar-container';
        this.container.innerHTML = '<div class="progress-bar-fill"></div>';
        
        // Добавляем в начало body
        document.body.insertBefore(this.container, document.body.firstChild);
        
        this.fillElement = this.container.querySelector('.progress-bar-fill');
        
        // Проверяем есть ли нужная форма
        this.form = document.getElementById(this.formId);
        
        if (!this.form) {
            console.warn('FormProgressBar: Форма с id "' + this.formId + '" не найдена');
            this.container.style.display = 'none';
            return;
        }
        
        // Автоматически определяем поля для отслеживания если не указаны
        if (this.fields.length === 0) {
            this.autoDetectFields();
        }
        
        // Навешиваем обработчики
        this.attachListeners();
        
        // Первоначальный расчет
        this.updateProgress();
    }
    
    autoDetectFields() {
        // Основные поля формы
        const fieldSelectors = [
            { selector: '#releaseTitle', weight: 15, name: 'Название' },
            { selector: '#releaseLanguage', weight: 10, name: 'Язык' },
            { selector: '#releaseGenre', weight: 10, name: 'Жанр' },
            { selector: '#releaseLabel', weight: 10, name: 'Лейбл' },
            { selector: '#releaseArtist', weight: 15, name: 'Исполнитель' },
            { selector: '#coverInput', weight: 20, name: 'Обложка' },
            { selector: '.track-item', weight: 20, name: 'Треки' }
        ];
        
        // Проверяем наличие полей на странице
        this.fields = fieldSelectors.map(field => {
            const element = document.querySelector(field.selector);
            return {
                ...field,
                element: element,
                getValue: this.getFieldValue.bind(this, element, field.selector)
            };
        }).filter(field => field.element !== null);
        
        // Добавляем специальную проверку для треков
        this.checkTracks = true;
        
        console.log('FormProgressBar: Автоматически обнаружены поля:', this.fields.map(f => f.name));
    }
    
    getFieldValue(element, selector) {
        if (!element) return '';
        
        // Для файлового инпута
        if (element.type === 'file') {
            return element.files && element.files.length > 0 ? element.files[0] : null;
        }
        
        // Для select
        if (element.tagName === 'SELECT') {
            return element.value;
        }
        
        // Для обычных полей ввода
        return element.value?.trim() || '';
    }
    
    attachListeners() {
        // Слушаем события на всех полях
        this.fields.forEach(field => {
            if (field.element) {
                const events = field.element.tagName === 'SELECT' ? ['change'] : ['input', 'change'];
                events.forEach(event => {
                    field.element.addEventListener(event, () => {
                        setTimeout(() => this.updateProgress(), 50);
                    });
                });
            }
        });
        
        // Слушаем добавление/удаление треков через MutationObserver
        const tracklistContainer = document.getElementById('tracklistContainer');
        if (tracklistContainer) {
            const observer = new MutationObserver(() => {
                setTimeout(() => this.updateProgress(), 50);
            });
            observer.observe(tracklistContainer, { childList: true, subtree: true });
        }
        
        // Слушаем загрузку обложки
        const coverInput = document.getElementById('coverInput');
        if (coverInput) {
            coverInput.addEventListener('change', () => {
                setTimeout(() => this.updateProgress(), 50);
            });
        }
        
        // Слушаем обновление полей треков (динамически добавленные)
        document.addEventListener('input', (e) => {
            if (e.target.matches('[data-track-field="name"]') || 
                e.target.matches('input[type="file"][accept*="audio"]')) {
                setTimeout(() => this.updateProgress(), 50);
            }
        });
    }
    
    getTracksCompletion() {
        // Проверяем количество заполненных треков
        const trackInputs = document.querySelectorAll('[data-track-field="name"]');
        if (trackInputs.length === 0) return 0;
        
        let filledTracks = 0;
        let hasAudio = false;
        
        trackInputs.forEach(input => {
            if (input.value && input.value.trim()) {
                filledTracks++;
            }
        });
        
        // Проверяем есть ли хотя бы один аудиофайл
        const audioInputs = document.querySelectorAll('input[type="file"][accept*="audio"]');
        audioInputs.forEach(input => {
            if (input.files && input.files.length > 0) {
                hasAudio = true;
            }
        });
        
        // Если есть хотя бы один трек с названием - считаем треклист частично заполненным
        if (filledTracks > 0) {
            // Чем больше треков, тем выше процент (но не более 100%)
            return Math.min(100, (filledTracks / Math.max(3, trackInputs.length)) * 100);
        }
        
        return 0;
    }
    
    calculateProgress() {
        let totalWeight = 0;
        let filledWeight = 0;
        
        this.fields.forEach(field => {
            totalWeight += field.weight;
            
            const value = field.getValue();
            let isFilled = false;
            
            // Проверяем заполненность в зависимости от типа поля
            if (field.selector === '#coverInput') {
                // Обложка: проверяем наличие файла
                const coverInput = document.getElementById('coverInput');
                isFilled = coverInput && coverInput.files && coverInput.files.length > 0;
                
                // Также проверяем base64 preview
                if (!isFilled && window.coverBase64) {
                    isFilled = true;
                }
            } 
            else if (field.selector === '.track-item') {
                // Треки: используем специальную проверку
                const tracksCompletion = this.getTracksCompletion();
                filledWeight += (field.weight * tracksCompletion) / 100;
                return;
            }
            else {
                // Обычные поля: проверяем что не пусто
                isFilled = value && value !== '' && value !== 'Выберите язык' && value !== 'Выберите жанр';
            }
            
            if (isFilled) {
                filledWeight += field.weight;
            }
        });
        
        // Дополнительная проверка для треков, если нет специального поля
        if (!this.fields.some(f => f.selector === '.track-item')) {
            const tracksCompletion = this.getTracksCompletion();
            filledWeight += 20 * (tracksCompletion / 100);
            totalWeight += 20;
        }
        
        let progress = totalWeight > 0 ? (filledWeight / totalWeight) * 100 : 0;
        return Math.min(100, Math.max(0, Math.round(progress)));
    }
    
    updateProgress() {
        const progress = this.calculateProgress();
        
        // Обновляем только если прогресс изменился
        if (Math.abs(progress - this.lastProgress) < this.updateThreshold && this.lastProgress === progress) {
            return;
        }
        
        this.lastProgress = progress;
        
        if (this.fillElement) {
            this.fillElement.style.width = progress + '%';
            
            // Добавляем класс при достижении 100%
            if (progress >= 100) {
                this.fillElement.classList.add('complete');
                if (this.onComplete) {
                    this.onComplete();
                }
            } else {
                this.fillElement.classList.remove('complete');
            }
            
            // Отображаем процент на прогресс-баре (опционально)
            // this.fillElement.setAttribute('data-progress', progress + '%');
        }
        
        console.log(`FormProgressBar: Прогресс заполнения - ${progress}%`);
    }
    
    reset() {
        if (this.fillElement) {
            this.fillElement.style.width = '0%';
            this.fillElement.classList.remove('complete');
        }
        this.lastProgress = 0;
    }
    
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
    
    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }
}

// Автоматический запуск при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, находимся ли мы на странице создания релиза
    const isNewReleasePage = !!document.getElementById('releaseForm');
    
    if (isNewReleasePage) {
        // Создаем экземпляр прогресс-бара с настройками
        window.progressBar = new FormProgressBar({
            formId: 'releaseForm',
            updateThreshold: 50,
            onComplete: () => {
                console.log('🎉 Форма заполнена на 100%!');
                // Можно добавить визуальный эффект или уведомление
                const submitBtn = document.getElementById('submitRelease');
                if (submitBtn) {
                    submitBtn.style.animation = 'pulse 0.5s ease-in-out 2';
                }
            }
        });
    }
});