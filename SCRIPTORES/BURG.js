document.addEventListener('DOMContentLoaded', function() {
    const burgerToggle = document.getElementById('burgerToggle');
    const mainMenu = document.getElementById('mainMenu');
    
    if (!burgerToggle || !mainMenu) {
        console.error('Элементы меню не найдены');
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'MENUoverlay';
    overlay.id = 'menuOverlay';
    document.body.appendChild(overlay);
    
    const dropToggles = mainMenu.querySelectorAll('.drop-toggle');
    
    function toggleMainMenu() {
        if (burgerToggle.classList.contains('active')) {
            closeMainMenu();
        } else {
            openMainMenu();
        }
    }
    
    function openMainMenu() {
        burgerToggle.classList.add('active');
        mainMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        burgerToggle.setAttribute('aria-expanded', 'true');
    }
    
    function closeMainMenu() {
        burgerToggle.classList.remove('active');
        mainMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        burgerToggle.setAttribute('aria-expanded', 'false');
        
        dropToggles.forEach(toggle => {
            const dropdown = toggle.closest('.DROPbutt');
            if (dropdown) {
                dropdown.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    function handleDropdownClick(e) {
        if (window.innerWidth > 768) {
            e.preventDefault();
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        const dropdown = this.closest('.DROPbutt');
        const isActive = dropdown.classList.contains('active');
        
        dropToggles.forEach(toggle => {
            const otherDropdown = toggle.closest('.DROPbutt');
            if (otherDropdown && otherDropdown !== dropdown) {
                otherDropdown.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        if (!isActive) {
            dropdown.classList.add('active');
            this.setAttribute('aria-expanded', 'true');
        } else {
            dropdown.classList.remove('active');
            this.setAttribute('aria-expanded', 'false');
        }
    }
    
    burgerToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMainMenu();
    });
    
    overlay.addEventListener('click', function() {
        closeMainMenu();
    });
    
    dropToggles.forEach(toggle => {
        toggle.addEventListener('click', handleDropdownClick);
    });
    
    mainMenu.addEventListener('click', function(e) {
        const link = e.target.closest('.NAVBUTT');
        if (link && !link.classList.contains('drop-toggle')) {
            setTimeout(closeMainMenu, 300);
        }
    });
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMainMenu();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && burgerToggle.classList.contains('active')) {
            closeMainMenu();
        }
    });
    
    burgerToggle.setAttribute('aria-controls', 'mainMenu');
    burgerToggle.setAttribute('aria-expanded', 'false');
    
    if (window.innerWidth > 768) {
        const dropdowns = mainMenu.querySelectorAll('.DROPbutt');
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('mouseenter', function() {
                if (window.innerWidth > 768) {
                    this.classList.add('active');
                }
            });
            
            dropdown.addEventListener('mouseleave', function() {
                if (window.innerWidth > 768) {
                    this.classList.remove('active');
                }
            });
        });
    }
});