
const config = {
    telegram: {
        botToken: '7564908163:AAGODR5Z6V586b81B5ghU0D1aGGx2CzIjyk',
        chatId: '-4698373221',
        apiUrl: 'https://api.telegram.org/bot'
    },
    messages: {
        success: '✅ Спасибо! Ваша заявка отправлена.',
        error: '❌ Ошибка при отправке. Позвоните нам напрямую.',
        validation: '⚠️ Заполните обязательные поля',
        loading: '<i class="fas fa-spinner fa-spin"></i> Отправка...'
    }
};

// Основная функция инициализации
document.addEventListener('DOMContentLoaded', function() {
    initForms();
    initScrollButton();
    loadDataAndInitializeUI(); 
});

// Инициализация всех форм
function initForms() {
    // Обработка стандартных форм
    document.querySelectorAll('.enrollment-form__content:not(.enrollment-modal__form)').forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleFormSubmit(this);
        });
    });

    // Инициализация модального окна
    initModal();
}

// Обработка стандартной формы
async function handleFormSubmit(form) {
    const formData = {
        name: form.querySelector('.enrollment-form__input[placeholder="Ваше имя"]').value,
        phone: form.querySelector('.enrollment-form__input[placeholder="Телефон"]').value,
        course: form.querySelector('.enrollment-form__select')?.value || 'не указан',
        location: form.closest('.enrollment-form').dataset.location || 'не указано'
    };

    if (!validateForm(formData)) return;

    const submitBtn = form.querySelector('.enrollment-form__submit');
    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = config.messages.loading;

    const message = generateStandardMessage(formData);
    await sendToTelegram(message, form, submitBtn, originalContent);
}

// Валидация формы
function validateForm(formData) {
    if (!formData.name || !formData.phone) {
        alert(config.messages.validation);
        return false;
    }
    return true;
}

// Генерация сообщения для стандартной формы
function generateStandardMessage(data) {
    return `📌 *Новая заявка* (${data.location}):\n\n` +
        `👤 *Имя*: ${data.name}\n` +
        `📞 *Телефон*: ${data.phone}\n` +
        `📚 *Курс*: ${data.course}`;
}

// Отправка в Telegram
async function sendToTelegram(message, form, submitBtn, originalContent) {
    try {
        const response = await fetch(`${config.telegram.apiUrl}${config.telegram.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: config.telegram.chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();
        if (result.ok) {
            alert(config.messages.success);
            if (form) form.reset();
        } else {
            throw new Error('Telegram API error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert(config.messages.error);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    }
}

// Инициализация модального окна
function initModal() {
    const modal = new bootstrap.Modal(document.getElementById('enrollmentModal'));

    document.querySelectorAll('[data-bs-toggle="modal"]').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.show();
        });
    });
}

// Кнопка скролла
function initScrollButton() {
    const scrollBtn = document.getElementById('scrollTopBtn');

    window.addEventListener('scroll', () => {
        scrollBtn.style.display = (window.pageYOffset > 300) ? 'block' : 'none';
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Новая функция для загрузки данных и инициализации UI
async function loadDataAndInitializeUI() {
    try {
       
        const response = await fetch('data/data.json'); 
        

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        renderFeatures(data.features);
        renderTeachers(data.teachers);
        initSwiper(); 

       
        setTimeout(hidePreloader, 500); 
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        hidePreloader();
        alert('Не удалось загрузить данные. Попробуйте обновить страницу.');
    }
}

function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hidden');
       
        preloader.addEventListener('transitionend', function() {
            preloader.remove();
        });
    }
}

// Рендер преимуществ
function renderFeatures(features) {
    const container = document.querySelector('.features__grid');
    if (container) {
        container.innerHTML = features.map(feature => `
            <div class="feature">
                <div class="feature__icon">
                    <i class="${feature.icon}"></i>
                </div>
                <h3 class="feature__title">${feature.title}</h3>
                <p class="feature__text">${feature.text}</p>
            </div>
        `).join('');
    }
}

// Рендер преподавателей
function renderTeachers(teachers) {
    const container = document.querySelector('.teacherSwiper .swiper-wrapper');
    if (container) {
        container.innerHTML = teachers.map(teacher => `
            <div class="swiper-slide">
                <div class="teacher">
                    <img src="${teacher.photo}" alt="${teacher.name}" class="teacher__photo">
                    <h3 class="teacher__name">${teacher.name}</h3>
                    <p class="teacher__subject">${teacher.subject}</p>
                    <button class="button button--primary button--sm" data-bs-toggle="modal" data-bs-target="#enrollmentModal">Записаться</button>
                </div>
            </div>
        `).join('');
    }
}

// Инициализация Swiper
function initSwiper() {
    const teacherSwiperElement = document.querySelector('.teacherSwiper');
    if (teacherSwiperElement && teacherSwiperElement.querySelector('.swiper-slide')) {
        const teacherSwiper = new Swiper('.teacherSwiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });
    } else {
        console.warn('Swiper не инициализирован: элементы слайдера не найдены.');
    }
}