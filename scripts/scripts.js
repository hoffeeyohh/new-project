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

// Обработка модальной формы
async function handleModalFormSubmit() {
    const form = document.querySelector('.enrollment-modal__form');
    const formData = {
        name: form.querySelector('.enrollment-form__input[placeholder="Ваше имя"]').value,
        phone: form.querySelector('.enrollment-form__input[placeholder="Телефон"]').value,
        comment: form.querySelector('.enrollment-form__textarea').value,
        callback: form.querySelector('.enrollment-form__checkbox input').checked,
        teacher: document.querySelector('.enrollment-form__teacher-item--selected')?.textContent || 'не указан',
        time: document.querySelector('.enrollment-form__time-slot--selected')?.textContent || 'не указано'
    };

    if (!validateForm(formData)) return;

    const submitBtn = document.querySelector('.enrollment-form__nav-btn--next');
    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = config.messages.loading;

    const message = generateModalMessage(formData);
    await sendToTelegram(message, form, submitBtn, originalContent);

    // Закрываем модальное окно после успешной отправки
    bootstrap.Modal.getInstance(document.getElementById('enrollmentModal')).hide();
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

// Генерация сообщения для модальной формы
function generateModalMessage(data) {
    return `📌 *Новая заявка* (Модальное окно):\n\n` +
        `👤 *Имя*: ${data.name}\n` +
        `📞 *Телефон*: ${data.phone}\n` +
        `👨‍🏫 *Преподаватель*: ${data.teacher}\n` +
        `⏰ *Время*: ${data.time}\n` +
        `📝 *Комментарий*: ${data.comment || '—'}\n` +
        `📞 *Обратный звонок*: ${data.callback ? '✅ Да' : '❌ Нет'}`;
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

    // Открытие по кнопкам с атрибутом [data-enrollment-modal]
    document.querySelectorAll('[data-enrollment-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            renderTeachers();
            modal.show();
        });
    });

    // Навигация по шагам
    document.querySelector('.enrollment-form__nav-btn--next').addEventListener('click', function() {
        const currentStep = document.querySelector('.enrollment-form__step--active');
        const currentStepIndex = Array.from(document.querySelectorAll('.enrollment-form__step')).indexOf(currentStep);

        // Если это последний шаг — отправка формы
        if (currentStepIndex === 1) {
            handleModalFormSubmit();
            return;
        }

        // Переключение шагов
        currentStep.classList.remove('enrollment-form__step--active');
        document.querySelectorAll('.enrollment-form__step')[currentStepIndex + 1].classList.add('enrollment-form__step--active');
        document.querySelectorAll('.enrollment-form__step-dot')[currentStepIndex].classList.remove('enrollment-form__step-dot--active');
        document.querySelectorAll('.enrollment-form__step-dot')[currentStepIndex + 1].classList.add('enrollment-form__step-dot--active');
        document.querySelector('.enrollment-form__nav-btn--prev').disabled = false;

        // Обновление текста кнопки на последнем шаге
        if (currentStepIndex + 1 === 1) {
            this.innerHTML = 'Отправить <i class="fas fa-paper-plane"></i>';
        }
    });

    document.querySelector('.enrollment-form__nav-btn--prev').addEventListener('click', function() {
        const currentStep = document.querySelector('.enrollment-form__step--active');
        const currentStepIndex = Array.from(document.querySelectorAll('.enrollment-form__step')).indexOf(currentStep);

        currentStep.classList.remove('enrollment-form__step--active');
        document.querySelectorAll('.enrollment-form__step')[currentStepIndex - 1].classList.add('enrollment-form__step--active');
        document.querySelectorAll('.enrollment-form__step-dot')[currentStepIndex].classList.remove('enrollment-form__step-dot--active');
        document.querySelectorAll('.enrollment-form__step-dot')[currentStepIndex - 1].classList.add('enrollment-form__step-dot--active');
        document.querySelector('.enrollment-form__nav-btn--next').innerHTML = 'Далее <i class="fas fa-arrow-right"></i>';

        if (currentStepIndex - 1 === 0) {
            this.disabled = true;
        }
    });
}

// Рендер списка преподавателей
function renderTeachers() {
    const teachersList = document.querySelector('.enrollment-form__teachers-list');
    teachersList.innerHTML = '';

    const teachers = [
        { id: 1, name: 'Анна И.', subject: 'Английский', photo: 'img/teacher1.jpg' },
        { id: 2, name: 'Петр С.', subject: 'Немецкий', photo: 'img/teacher2.jpg' },
        { id: 3, name: 'Мария П.', subject: 'Французский', photo: 'img/teacher3.jpg' },
        { id: 4, name: 'Иван К.', subject: 'Испанский', photo: 'img/teacher4.jpg' }
    ];

    teachers.forEach(teacher => {
        const teacherItem = document.createElement('div');
        teacherItem.className = 'enrollment-form__teacher-item';
        teacherItem.dataset.teacherId = teacher.id;
        teacherItem.innerHTML = `
      <img src="${teacher.photo}" alt="${teacher.name}" class="enrollment-form__teacher-photo">
      <span class="enrollment-form__teacher-name">${teacher.name}</span>
      <small>${teacher.subject}</small>
    `;
        teacherItem.addEventListener('click', () => {
            document.querySelectorAll('.enrollment-form__teacher-item').forEach(item => {
                item.classList.remove('enrollment-form__teacher-item--selected');
            });
            teacherItem.classList.add('enrollment-form__teacher-item--selected');
            renderSchedule(teacher.id);
        });
        teachersList.appendChild(teacherItem);
    });
}

// Рендер расписания
function renderSchedule(teacherId) {
    const scheduleDays = document.querySelector('.enrollment-form__schedule-days');
    scheduleDays.innerHTML = '';

    const schedule = {
        1: [
            { day: 'Пн', slots: ['10:00', '14:00'] },
            { day: 'Ср', slots: ['11:00', '15:00'] }
        ],
        2: [
            { day: 'Вт', slots: ['09:00', '13:00'] }
        ]
    };

    if (schedule[teacherId]) {
        schedule[teacherId].forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'enrollment-form__day';
            dayElement.innerHTML = `
        <div class="enrollment-form__day-name">${day.day}</div>
        <div class="enrollment-form__time-slots"></div>
      `;

            const timeSlots = dayElement.querySelector('.enrollment-form__time-slots');
            day.slots.forEach(slot => {
                const slotElement = document.createElement('div');
                slotElement.className = 'enrollment-form__time-slot';
                slotElement.textContent = slot;
                slotElement.addEventListener('click', () => {
                    document.querySelectorAll('.enrollment-form__time-slot').forEach(s => {
                        s.classList.remove('enrollment-form__time-slot--selected');
                    });
                    slotElement.classList.add('enrollment-form__time-slot--selected');
                });
                timeSlots.appendChild(slotElement);
            });

            scheduleDays.appendChild(dayElement);
        });
    } else {
        scheduleDays.innerHTML = '<div class="text-muted">Расписание не доступно</div>';
    }
}
// 1. Создаем массив преимуществ
const features = [
    "Опытные преподаватели",
    "Индивидуальный подход", 
    "Международные сертификаты"
  ];
  
  // 2. Выводим в блок features
  const featuresContainer = document.querySelector('.features__grid');
  
  features.forEach((feature, index) => {
    featuresContainer.innerHTML += `
      <div class="feature">
        <h3>Преимущество ${index + 1}</h3>
        <p>${feature}</p>
      </div>
    `;
  });
  // Кнопка скролла
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
// 1. Создаем объект с данными
const featuresData = {
    feature1: {
      icon: 'fas fa-chalkboard-teacher',
      title: 'Опытные преподаватели',
      description: 'Все наши преподаватели имеют международные сертификаты'
    },
    feature2: {
      icon: 'fas fa-user-graduate',
      title: 'Индивидуальный подход',
      description: 'Программа подбирается под ваш уровень'
    }
  };
  
  // 2. Выводим данные в вёрстку 
  const featuresContainer = document.querySelector('.features__grid');
  featuresContainer.innerHTML = `
    <div class="feature">
      <i class="${featuresData.feature1.icon}"></i>
      <h3>${featuresData.feature1.title}</h3>
      <p>${featuresData.feature1.description}</p>
    </div>
  `;

  // Загрузка данных из JSON
async function loadData() {
    try {
      const response = await fetch('data.json');
      if (!response.ok) throw new Error('Ошибка загрузки');
      const data = await response.json();
      renderFeatures(data.features);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  }
  
  function renderFeatures(features) {
    const container = document.querySelector('.features__grid');
    container.innerHTML = features.map(feature => `
      <div class="feature">
        <i class="${feature.icon}"></i>
        <h3>${feature.title}</h3>
        <p>${feature.text}</p>
      </div>
    `).join('');
  }
  
  // Запускаем загрузку при старте
  loadData();


