(function() {
    let preloaderElement = null;
    let targetUrl = null;
    
    function showPreloader(url) {
        if (preloaderElement) return;
        
        targetUrl = url;
        
        preloaderElement = document.createElement('div');
        preloaderElement.id = 'preloader';
        preloaderElement.innerHTML = `
            <div class="preloader-line">
                <div class="preloader-line-fill"></div>
            </div>
        `;
        document.body.appendChild(preloaderElement);
        
        const fill = document.querySelector('.preloader-line-fill');
        let width = 0;
        
        const interval = setInterval(() => {
            width += 5;
            if (fill) fill.style.width = width + '%';
            
            if (width >= 100) {
                clearInterval(interval);
                if (targetUrl) {
                    window.location.href = targetUrl;
                }
            }
        }, 20);
        
        preloaderElement._interval = interval;
    }
    
    function hidePreloader() {
        if (preloaderElement) {
            if (preloaderElement._interval) {
                clearInterval(preloaderElement._interval);
            }
            const fill = document.querySelector('.preloader-line-fill');
            if (fill) fill.style.width = '100%';
            
            setTimeout(() => {
                if (preloaderElement && preloaderElement.parentNode) {
                    preloaderElement.parentNode.removeChild(preloaderElement);
                    preloaderElement = null;
                }
            }, 200);
        }
    }
    
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
        }
        
        if (link.hasAttribute('data-no-preloader')) return;
        
        const currentOrigin = window.location.origin;
        const linkOrigin = (new URL(href, window.location.href)).origin;
        
        if (currentOrigin === linkOrigin && !href.startsWith('#')) {
            e.preventDefault();
            showPreloader(href);
        }
    });
    
    window.addEventListener('load', function() {
        setTimeout(hidePreloader, 100);
    });
})();