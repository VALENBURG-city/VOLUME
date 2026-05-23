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
        this.container = document.createElement('div');
        this.container.className = 'progress-bar-container';
        this.container.innerHTML = '<div class="progress-bar-fill"></div>';
        
        document.body.insertBefore(this.container, document.body.firstChild);
        
        this.fillElement = this.container.querySelector('.progress-bar-fill');
        this.form = document.getElementById(this.formId);
        
        if (!this.form) {
            console.warn('FormProgressBar: Форма с id "' + this.formId + '" не найдена');
            this.container.style.display = 'none';
            return;
        }
        
        if (this.fields.length === 0) {
            this.autoDetectFields();
        }
        
        this.attachListeners();
        this.updateProgress();
    }
    
    autoDetectFields() {
        const fieldSelectors = [
            { selector: '#releaseTitle', weight: 15, name: 'Название' },
            { selector: '#releaseLanguage', weight: 10, name: 'Язык' },
            { selector: '#releaseGenre', weight: 10, name: 'Жанр' },
            { selector: '#releaseLabel', weight: 10, name: 'Лейбл' },
            { selector: '#releaseArtist', weight: 15, name: 'Исполнитель' },
            { selector: '#coverInput', weight: 20, name: 'Обложка' },
            { selector: '#tracklistContainer', weight: 20, name: 'Треки' }
        ];
        
        this.fields = fieldSelectors.map(field => {
            const element = document.querySelector(field.selector);
            return {
                ...field,
                element: element,
                getValue: this.getFieldValue.bind(this, element, field.selector)
            };
        }).filter(field => field.element !== null);
        
        console.log('FormProgressBar: Автоматически обнаружены поля:', this.fields.map(f => f.name));
    }
    
    getFieldValue(element, selector) {
        if (!element) return '';
        
        if (element.type === 'file') {
            return element.files && element.files.length > 0 ? element.files[0] : null;
        }
        
        if (element.tagName === 'SELECT') {
            return element.value;
        }
        
        return element.value?.trim() || '';
    }
    
    attachListeners() {
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
        
        const tracklistContainer = document.getElementById('tracklistContainer');
        if (tracklistContainer) {
            const observer = new MutationObserver(() => {
                setTimeout(() => this.updateProgress(), 100);
            });
            observer.observe(tracklistContainer, { childList: true, subtree: true });
        }
        
        const coverInput = document.getElementById('coverInput');
        if (coverInput) {
            coverInput.addEventListener('change', () => {
                setTimeout(() => this.updateProgress(), 100);
            });
        }
        
        document.addEventListener('input', (e) => {
            if (e.target.matches('[data-track-field="name"]') || 
                e.target.matches('input[type="file"][accept*="audio"]')) {
                setTimeout(() => this.updateProgress(), 100);
            }
        });
    }
    
    getTracksCompletion() {
        const trackNameInputs = document.querySelectorAll('[data-track-field="name"]');
        const audioInputs = document.querySelectorAll('input[type="file"][accept*="audio"]');
        
        if (trackNameInputs.length === 0) return 0;
        
        let filledTrackNames = 0;
        let filledAudioFiles = 0;
        
        trackNameInputs.forEach(input => {
            if (input.value && input.value.trim() !== '') {
                filledTrackNames++;
            }
        });
        
        audioInputs.forEach(input => {
            if (input.files && input.files.length > 0) {
                filledAudioFiles++;
            }
        });
        
        const totalTracks = trackNameInputs.length;
        
        let trackScore = 0;
        if (filledTrackNames > 0) {
            trackScore = (filledTrackNames / totalTracks) * 60;
        }
        
        let audioScore = 0;
        if (filledAudioFiles > 0) {
            audioScore = Math.min(40, (filledAudioFiles / totalTracks) * 40);
        }
        
        let totalScore = trackScore + audioScore;
        
        if (filledTrackNames === totalTracks && filledAudioFiles >= 1) {
            totalScore = 100;
        }
        
        return Math.min(100, Math.max(0, totalScore));
    }
    
    calculateProgress() {
        let totalWeight = 0;
        let filledWeight = 0;
        
        let coverIsFilled = false;
        let tracksCompletion = 0;
        
        this.fields.forEach(field => {
            totalWeight += field.weight;
            
            let isFilled = false;
            
            if (field.selector === '#coverInput') {
                const coverInput = document.getElementById('coverInput');
                const hasFile = coverInput && coverInput.files && coverInput.files.length > 0;
                const hasBase64 = window.coverBase64 && window.coverBase64 !== '';
                
                isFilled = hasFile || hasBase64;
                coverIsFilled = isFilled;
            } 
            else if (field.selector === '#tracklistContainer') {
                tracksCompletion = this.getTracksCompletion();
                filledWeight += (field.weight * tracksCompletion) / 100;
                return;
            }
            else {
                const value = field.getValue();
                isFilled = value && value !== '' && value !== 'Выберите язык' && value !== 'Выберите жанр';
            }
            
            if (isFilled) {
                filledWeight += field.weight;
            }
        });
        
        if (coverIsFilled && tracksCompletion >= 80) {
            const currentProgress = (filledWeight / totalWeight) * 100;
            if (currentProgress >= 85 && tracksCompletion === 100) {
                return 100;
            }
        }
        
        let progress = totalWeight > 0 ? (filledWeight / totalWeight) * 100 : 0;
        return Math.min(100, Math.max(0, Math.round(progress)));
    }
    
    updateProgress() {
        const progress = this.calculateProgress();
        
        if (Math.abs(progress - this.lastProgress) < this.updateThreshold && this.lastProgress === progress && progress !== 100) {
            return;
        }
        
        this.lastProgress = progress;
        
        if (this.fillElement) {
            this.fillElement.style.width = progress + '%';
            
            if (progress >= 100) {
                this.fillElement.classList.add('complete');
                if (this.onComplete) {
                    this.onComplete();
                }
            } else {
                this.fillElement.classList.remove('complete');
            }
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

document.addEventListener('DOMContentLoaded', () => {
    const isNewReleasePage = !!document.getElementById('releaseForm');
    
    if (isNewReleasePage) {
        window.progressBar = new FormProgressBar({
            formId: 'releaseForm',
            updateThreshold: 50,
            onComplete: () => {
                console.log('Форма заполнена на 100%');
                const submitBtn = document.getElementById('submitRelease');
                if (submitBtn) {
                    submitBtn.style.animation = 'pulse 0.5s ease-in-out 2';
                }
            }
        });
        
        setInterval(() => {
            if (window.progressBar) {
                window.progressBar.updateProgress();
            }
        }, 500);
    }
});