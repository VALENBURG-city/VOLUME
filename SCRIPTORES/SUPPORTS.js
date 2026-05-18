const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        item.classList.toggle('active');
    });
});

const form = document.getElementById('supportForm');
const messageDiv = document.getElementById('formSupportMessage');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const msg = document.getElementById('userMessage').value.trim();
    
    if (!name || !email || !msg) {
        messageDiv.innerHTML = '<span style="color: red;">❌ Пожалуйста, заполните все обязательные поля.</span>';
        return;
    }
    
    if (!email.includes('@')) {
        messageDiv.innerHTML = '<span style="color: red;">❌ Введите корректный email.</span>';
        return;
    }
    
    messageDiv.innerHTML = '<span style="color: var(--ACCENT);">✅ Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время (учебная демонстрация).</span>';
    form.reset();
    
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
    
    let notif = document.getElementById('notification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'notification';
        notif.className = 'notification';
        document.body.appendChild(notif);
    }
    
    notif.innerText = 'Заявка в поддержку принята. Ответ придёт на email.';
    notif.classList.add('show', 'success');
    
    setTimeout(() => {
        notif.classList.remove('show');
    }, 3000);
});const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        item.classList.toggle('active');
    });
});

const form = document.getElementById('supportForm');
const messageDiv = document.getElementById('formSupportMessage');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const msg = document.getElementById('userMessage').value.trim();
    
    if (!name || !email || !msg) {
        messageDiv.innerHTML = '<span style="color: red;">❌ Пожалуйста, заполните все обязательные поля.</span>';
        return;
    }
    
    if (!email.includes('@')) {
        messageDiv.innerHTML = '<span style="color: red;">❌ Введите корректный email.</span>';
        return;
    }
    
    messageDiv.innerHTML = '<span style="color: var(--ACCENT);">✅ Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время (учебная демонстрация).</span>';
    form.reset();
    
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
    
    let notif = document.getElementById('notification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'notification';
        notif.className = 'notification';
        document.body.appendChild(notif);
    }
    
    notif.innerText = 'Заявка в поддержку принята. Ответ придёт на email.';
    notif.classList.add('show', 'success');
    
    setTimeout(() => {
        notif.classList.remove('show');
    }, 3000);
});