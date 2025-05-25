/**
 * Унифицированная система форм с отправкой в Telegram
 */

// Конфигурация
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
    loadData();
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

// Загрузка данных
async function loadData() {
    try {
        // Мок данные, если нет data.json
        const mockData = {
            features: [
                {
                    icon: 'fas fa-chalkboard-teacher',
                    title: 'Опытные преподаватели',
                    text: 'Все наши преподаватели имеют международные сертификаты и минимум 5 лет опыта работы.'
                },
                {
                    icon: 'fas fa-user-graduate',
                    title: 'Индивидуальный подход',
                    text: 'Программа обучения подбирается индивидуально под ваши цели и уровень подготовки.'
                },
                {
                    icon: 'fas fa-certificate',
                    title: 'Международные сертификаты',
                    text: 'По окончании курса вы получите сертификат международного образца.'
                }
            ],
            teachers: [
                {
                    id: 1,
                    photo: 'img/teacher_anna.png',
                    name: 'Анна Иванова',
                    subject: 'Английский язык'
                },
                {
                    id: 2,
                    photo: 'img/teacher_zinaida.png',
                    name: 'Зинаида Петровна',
                    subject: 'Немецкий язык'
                },
                {
                    id: 3,
                    photo: 'img/teacher_maria.png',
                    name: 'Мария Петрова',
                    subject: 'Французский язык'
                },
                {
                    id: 4,
                    photo: 'img/teacher_ivan.png',
                    name: 'Иван Кузнецов',
                    subject: 'Испанский язык'
                }
            ]
        };

        renderFeatures(mockData.features);
        renderTeachers(mockData.teachers);
        initSwiper();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
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
    if (document.querySelector('.teacherSwiper')) {
        const teacherSwiper = new Swiper('.teacherSwiper', {
            slidesPerView: 1, // Всегда 1 слайд
            spaceBetween: 20, // Расстояние между слайдами (можно оставить, если нужно)
            loop: true, // для зацикливания
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            // брейки под разные устройства
            /*
            breakpoints: {
                768: {
                    slidesPerView: 2,
                },
                992: {
                    slidesPerView: 3,
                },
                1200: {
                    slidesPerView: 4,
                }
            }
            */
        });
    }
}