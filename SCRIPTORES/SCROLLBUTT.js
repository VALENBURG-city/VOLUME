const scrollToTopBtn = document.getElementById('SCROLLTOP')

window.addEventListener('scroll', function() {
    
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }

})

scrollToTopBtn.addEventListener('click', function() {

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

});