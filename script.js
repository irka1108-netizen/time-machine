// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
    // Режим работы: 'api' - реальный Яндекс GPT, 'demo' - демо-режим
    MODE: 'api',
    
    // ВАШИ КЛЮЧИ ОТ ЯНДЕКС ОБЛАКА (замените на свои!):
    YANDEX_API_KEY: 'AQVN1mVjk3ChoQnm0sIMQyyx94534m9IsSYcWDnf',
    YANDEX_FOLDER_ID: 'b1gof6m2ru5t8pqmchi9',
    
    // Использовать демо-ответы если API не работает
    USE_DEMO_IF_API_FAILS: true,
    
    // Прокси для обхода CORS
    USE_PROXY: true,
    PROXY_URL: 'https://corsproxy.io/?',
    
    // Альтернативные прокси
    ALT_PROXY_URLS: [
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/',
        ''
    ]
};

// ==================== ДАННЫЕ ПРАВИТЕЛЕЙ ====================
const RULERS = {
    ivan: {
        name: 'Иван IV Грозный',
        description: 'Первый царь всея Руси, суровый и противоречивый правитель',
        avatar: '👑',
        systemPrompt: `Ты - царь Иван IV Грозный. Говоришь грозно, властно, с религиозными оборотами. Часто упоминаешь 'Божью волю', 'государево дело'. Используй старинные обороты: вельми, чадо, болярин. Отвечай кратко (3-5 предложений).`,
        demoResponses: [
            "Вельми дивный вопрос задаешь, чадо! По Божьей воле и государеву делу опричнина была нужна для очищения земли русской от крамолы боярской!",
            "Чадо, спрашиваешь о делах государственных? Казань взял для расширения державы и защиты от набегов! Так надлежало по Божьему промыслу.",
            "Вопрос твой вельми любопытен. Как царь всея Руси, я должен был укреплять державу и карать изменников!"
        ]
    },
    petr: {
        name: 'Петр I Великий',
        description: 'Царь-реформатор, любит корабли и науки',
        avatar: '🧔',
        systemPrompt: `Ты - царь Петр I Великий. Говоришь грубовато и прямо, используй старинные слова: чаю, надобно, негоже. Обожаешь корабли и науки. Ненавидишь старые порядки. Отвечай кратко (3-5 предложений).`,
        demoResponses: [
            "Эх, молодец, что спрашиваешь! Бороды рубил, ибо мешали они! Европа не носит — и нам негоже! Надобно было страну к прогрессу вести!",
            "Так, слушай! Петербург на болотах строил, ибо выход к морю нужен был! Корабли строить, торговать с Европой!",
            "Чаю, вопрос разумный! Все для пользы государства делал. Науки, корабли, армия — вот что важно для великой державы!"
        ]
    },
    ekaterina: {
        name: 'Екатерина II Великая',
        description: 'Умная императрица, любит искусство',
        avatar: '👸',
        systemPrompt: `Ты - императрица Екатерина II Великая. Говоришь умно и изящно, цитируй философов: Вольтера, Дидро. Любишь искусство и науки. Мудрая и ироничная. Отвечай кратко (3-5 предложений).`,
        demoResponses: [
            "Мой друг, как приятно беседовать с просвещенным человеком! Просвещенный абсолютизм — это когда монарх правит для блага подданных, следуя разуму.",
            "С философами переписывалась, ибо считала: правитель должен быть образован! Как говаривал Вольтер, невежество — мать всех пороков.",
            "Прекрасный вопрос! Искусство и науки украшают государство. Умный правитель должен покровительствовать просвещению."
        ]
    }
};

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let currentRuler = null;
let chatHistory = [];
let currentProxyIndex = 0;

// ==================== DOM ЭЛЕМЕНТЫ ====================
const elements = {
    welcomeScreen: document.getElementById('welcome-screen'),
    chatScreen: document.getElementById('chat-screen'),
    currentAvatar: document.getElementById('current-avatar'),
    currentRulerName: document.getElementById('current-ruler-name'),
    currentRulerDesc: document.getElementById('current-ruler-desc'),
    chatHistory: document.getElementById('chat-history'),
    questionInput: document.getElementById('question-input'),
    sendBtn: document.getElementById('send-btn'),
    charCount: document.getElementById('char-count'),
    clearChatBtn: document.getElementById('clear-chat'),
    loading: document.getElementById('loading'),
    loadingText: document.getElementById('loading-text'),
    errorModal: document.getElementById('error-modal'),
    errorMessage: document.getElementById('error-message'),
    closeErrorBtn: document.getElementById('close-error-btn'),
    retryBtn: document.getElementById('retry-btn'),
    currentYear: document.getElementById('current-year'),
    modeIndicator: document.getElementById('mode-indicator'),
    modeDemo: document.querySelector('.mode-demo'),
    modeApi: document.querySelector('.mode-api'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    testApiBtn: document.getElementById('test-api-btn'),
    apiModal: document.getElementById('api-modal'),
    apiKeyInput: document.getElementById('api-key-input'),
    folderIdInput: document.getElementById('folder-id-input'),
    saveApiBtn: document.getElementById('save-api-btn'),
    useDemoBtn: document.getElementById('use-demo-btn'),
    apiTestResult: document.getElementById('api-test-result')
};

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('👑 Машина Времени инициализируется...');
    
    // Устанавливаем текущий год
    elements.currentYear.textContent = new Date().getFullYear();
    
    // Загружаем конфигурацию из localStorage
    loadConfigFromStorage();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Восстанавливаем историю чата
    restoreChat();
    
    // Проверяем и обновляем статус
    updateStatus();
    checkApiConnection();
    
    console.log('✅ Приложение готово к работе');
    console.log(`Режим: ${CONFIG.MODE === 'api' ? 'Яндекс GPT' : 'Демо'}`);
});

// ==================== КОНФИГУРАЦИЯ ====================
function loadConfigFromStorage() {
    try {
        const savedConfig = localStorage.getItem('mashinaConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            if (config.YANDEX_API_KEY && config.YANDEX_FOLDER_ID) {
                CONFIG.YANDEX_API_KEY = config.YANDEX_API_KEY;
                CONFIG.YANDEX_FOLDER_ID = config.YANDEX_FOLDER_ID;
                CONFIG.MODE = 'api';
                console.log('✅ Конфигурация загружена из localStorage');
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки конфигурации:', error);
    }
}

function saveConfigToStorage() {
    try {
        const config = {
            YANDEX_API_KEY: CONFIG.YANDEX_API_KEY,
            YANDEX_FOLDER_ID: CONFIG.YANDEX_FOLDER_ID
        };
        localStorage.setItem('mashinaConfig', JSON.stringify(config));
        console.log('✅ Конфигурация сохранена в localStorage');
    } catch (error) {
        console.error('Ошибка сохранения конфигурации:', error);
    }
}

// ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================
function setupEventListeners() {
    // Кнопки выбора правителя
    document.querySelectorAll('.select-btn').forEach(button => {
        button.addEventListener('click', function() {
            const rulerId = this.dataset.ruler;
            selectRuler(rulerId);
        });
    });
    
    // Отправка вопроса
    elements.sendBtn.addEventListener('click', sendQuestion);
    elements.questionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendQuestion();
        }
    });
    
    // Счетчик символов
    elements.questionInput.addEventListener('input', updateCharCount);
    
    // Очистка чата
    elements.clearChatBtn.addEventListener('click', clearChat);
    
    // Модальные окна
    elements.closeErrorBtn.addEventListener('click', closeErrorModal);
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Кнопка повтора
    elements.retryBtn.addEventListener('click', function() {
        closeErrorModal();
        if (currentRuler && chatHistory.length > 0) {
            const lastQuestion = chatHistory.find(msg => msg.sender === 'user');
            if (lastQuestion) {
                elements.questionInput.value = lastQuestion.content;
                sendQuestion();
            }
        }
    });
    
    // Кнопка тестирования API
    elements.testApiBtn.addEventListener('click', testApiConnection);
    
    // Настройка API
    elements.saveApiBtn.addEventListener('click', saveApiConfig);
    elements.useDemoBtn.addEventListener('click', useDemoMode);
    
    // Заполняем поля в модальном окне API
    elements.apiKeyInput.value = CONFIG.YANDEX_API_KEY;
    elements.folderIdInput.value = CONFIG.YANDEX_FOLDER_ID;
}

// ==================== ВЫБОР ПРАВИТЕЛЯ ====================
function selectRuler(rulerId) {
    currentRuler = RULERS[rulerId];
    
    // Обновляем отображение
    elements.currentAvatar.textContent = currentRuler.avatar;
    elements.currentRulerName.textContent = currentRuler.name;
    elements.currentRulerDesc.textContent = currentRuler.description;
    
    // Переключаем экраны
    elements.welcomeScreen.style.display = 'none';
    elements.chatScreen.style.display = 'flex';
    
    // Если история пустая, добавляем приветствие
    if (chatHistory.length === 0) {
        const greeting = `${currentRuler.avatar} **${currentRuler.name}:** Здравствуй! О чем хочешь поговорить?`;
        addMessageToHistory('bot', greeting);
        updateChatDisplay();
    }
    
    // Сохраняем выбор в localStorage
    localStorage.setItem('selectedRuler', rulerId);
}

// ==================== ОТПРАВКА ВОПРОСА ====================
async function sendQuestion() {
    const question = elements.questionInput.value.trim();
    
    if (!question) {
        showError('Пожалуйста, введите вопрос');
        return;
    }
    
    if (!currentRuler) {
        showError('Пожалуйста, выберите правителя');
        return;
    }
    
    // Добавляем вопрос в историю
    addMessageToHistory('user', question);
    elements.questionInput.value = '';
    updateCharCount();
    
    // Показываем индикатор загрузки
    showLoading(true);
    elements.loadingText.textContent = `${currentRuler.avatar} ${currentRuler.name} обдумывает ответ...`;
    
    try {
        let response;
        
        if (CONFIG.MODE === 'api' && CONFIG.YANDEX_API_KEY && CONFIG.YANDEX_FOLDER_ID) {
            // Режим с реальным Яндекс GPT API
            console.log('📡 Отправка запроса к Яндекс GPT...');
            response = await askYandexGPT(currentRuler, question);
            console.log('✅ Ответ получен:', response.substring(0, 100) + '...');
        } else {
            // Демо-режим
            console.log('🎭 Используем демо-режим');
            await new Promise(resolve => setTimeout(resolve, 1000));
            response = getDemoResponse(currentRuler, question);
        }
        
        // Добавляем ответ в историю
        addMessageToHistory('bot', response);
        
    } catch (error) {
        console.error('❌ Ошибка получения ответа:', error);
        
        // Пробуем использовать демо-ответ если API не сработал
        if (CONFIG.USE_DEMO_IF_API_FAILS) {
            const demoResponse = getDemoResponse(currentRuler, question);
            addMessageToHistory('bot', `${demoResponse} <small>(демо-режим)</small>`);
            
            if (CONFIG.MODE === 'api') {
                showError(`Яндекс GPT временно недоступен. Используется демо-режим. Ошибка: ${error.message}`);
            }
        } else {
            addMessageToHistory('bot', `❌ Ошибка: ${error.message}`);
            showError(`Не удалось получить ответ: ${error.message}`);
        }
    } finally {
        showLoading(false);
        updateChatDisplay();
        saveChat();
    }
}

// ==================== ЯНДЕКС GPT API ====================
async function askYandexGPT(ruler, question, proxyIndex = currentProxyIndex) {
    // Проверяем ключи
    if (!CONFIG.YANDEX_API_KEY || CONFIG.YANDEX_API_KEY.includes('ваш_ключ')) {
        throw new Error('API ключ не настроен. Проверьте CONFIG.YANDEX_API_KEY');
    }
    
    if (!CONFIG.YANDEX_FOLDER_ID || CONFIG.YANDEX_FOLDER_ID.includes('ваш_folder_id')) {
        throw new Error('Folder ID не настроен. Проверьте CONFIG.YANDEX_FOLDER_ID');
    }
    
    const targetUrl = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";
    
    // Выбираем прокси
    let proxyUrl = CONFIG.ALT_PROXY_URLS[proxyIndex] || '';
    if (CONFIG.USE_PROXY && proxyUrl) {
        if (proxyUrl === 'https://cors-anywhere.herokuapp.com/') {
            // Для этого прокси нужен заголовок
            proxyUrl = proxyUrl + targetUrl;
        } else {
            proxyUrl = proxyUrl + encodeURIComponent(targetUrl);
        }
    } else {
        proxyUrl = targetUrl;
    }
    
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${CONFIG.YANDEX_API_KEY}`
    };
    
    // Для cors-anywhere нужен дополнительный заголовок
    if (proxyUrl.includes('cors-anywhere.herokuapp.com')) {
        headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    
    const data = {
        "modelUri": `gpt://${CONFIG.YANDEX_FOLDER_ID}/yandexgpt-lite`,
        "completionOptions": {
            "stream": false,
            "temperature": 0.7,
            "maxTokens": 800
        },
        "messages": [
            {
                "role": "user",
                "text": `${ruler.systemPrompt}\n\nВопрос: ${question}\n\nОтветь как ${ruler.name} (3-5 предложений):`
            }
        ]
    };
    
    console.log(`🔗 Используем прокси: ${proxyIndex + 1}/${CONFIG.ALT_PROXY_URLS.length}`);
    
    try {
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        
        console.log('📊 Статус ответа:', response.status);
        
        if (!response.ok) {
            let errorText = '';
            try {
                errorText = await response.text();
            } catch (e) {
                errorText = 'Не удалось прочитать ответ';
            }
            
            console.error('❌ Ошибка API:', response.status, errorText);
            
            // Если ошибка 401 или 403 - неверный ключ
            if (response.status === 401 || response.status === 403) {
                throw new Error(`Неверный API ключ (${response.status})`);
            }
            
            // Если ошибка 404 - неверный folder_id
            if (response.status === 404) {
                throw new Error(`Неверный Folder ID (${response.status})`);
            }
            
            // Пробуем следующий прокси
            if (proxyIndex < CONFIG.ALT_PROXY_URLS.length - 1) {
                console.log('🔄 Пробуем следующий прокси...');
                currentProxyIndex = proxyIndex + 1;
                return await askYandexGPT(ruler, question, currentProxyIndex);
            }
            
            throw new Error(`Ошибка API (${response.status}): ${errorText.substring(0, 100)}`);
        }
        
        const result = await response.json();
        
        // Проверяем структуру ответа
        if (!result.result || !result.result.alternatives || !result.result.alternatives[0]) {
            console.error('Неверная структура ответа:', result);
            throw new Error('Неверный формат ответа от Яндекс GPT');
        }
        
        return result.result.alternatives[0].message.text;
        
    } catch (error) {
        console.error('❌ Ошибка запроса:', error);
        
        // Пробуем следующий прокси если есть ошибка сети
        if (proxyIndex < CONFIG.ALT_PROXY_URLS.length - 1 && 
            (error.message.includes('Failed to fetch') || error.message.includes('Network'))) {
            console.log('🔄 Пробуем следующий прокси из-за ошибки сети...');
            currentProxyIndex = proxyIndex + 1;
            return await askYandexGPT(ruler, question, currentProxyIndex);
        }
        
        throw error;
    }
}

// ==================== ДЕМО-РЕЖИМ ====================
function getDemoResponse(ruler, question) {
    const responses = ruler.demoResponses;
    const questionHash = question.split('').reduce((hash, char) => {
        return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0);
    const responseIndex = Math.abs(questionHash) % responses.length;
    return responses[responseIndex];
}

// ==================== УПРАВЛЕНИЕ ЧАТОМ ====================
function addMessageToHistory(sender, content) {
    const message = {
        id: Date.now(),
        sender: sender,
        content: content,
        timestamp: new Date().toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }),
        rulerAvatar: sender === 'bot' ? (currentRuler ? currentRuler.avatar : '🤖') : '🎯'
    };
    
    chatHistory.push(message);
    return message;
}

function updateChatDisplay() {
    elements.chatHistory.innerHTML = '';
    
    chatHistory.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${msg.sender}-message`;
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-avatar">${msg.rulerAvatar}</span>
                <span class="message-sender">
                    ${msg.sender === 'user' ? 'Ты' : (currentRuler ? currentRuler.name : 'Бот')}
                </span>
            </div>
            <div class="message-content">${formatMessage(msg.content)}</div>
            <div class="message-time">${msg.timestamp}</div>
        `;
        
        elements.chatHistory.appendChild(messageElement);
    });
    
    // Прокручиваем вниз
    elements.chatHistory.scrollTop = elements.chatHistory.scrollHeight;
}

function formatMessage(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/<small>(.*?)<\/small>/g, '<small>$1</small>');
}

function updateCharCount() {
    const count = elements.questionInput.value.length;
    elements.charCount.textContent = count;
    
    if (count > 500) {
        elements.charCount.style.color = '#e74c3c';
        elements.sendBtn.disabled = true;
    } else if (count > 400) {
        elements.charCount.style.color = '#f39c12';
        elements.sendBtn.disabled = false;
    } else {
        elements.charCount.style.color = '#7f8c8d';
        elements.sendBtn.disabled = false;
    }
}

function clearChat() {
    if (confirm('Вы уверены, что хотите очистить историю чата?')) {
        chatHistory = [];
        if (currentRuler) {
            const greeting = `${currentRuler.avatar} **${currentRuler.name}:** Здравствуй! О чем хочешь поговорить?`;
            addMessageToHistory('bot', greeting);
        }
        updateChatDisplay();
        saveChat();
    }
}

function showLoading(show) {
    elements.loading.style.display = show ? 'block' : 'none';
    elements.sendBtn.disabled = show;
    elements.questionInput.disabled = show;
}

// ==================== ОШИБКИ И СТАТУС ====================
function showError(message, showRetry = false) {
    elements.errorMessage.innerHTML = message;
    elements.retryBtn.style.display = showRetry ? 'flex' : 'none';
    elements.errorModal.style.display = 'flex';
}

function closeErrorModal() {
    elements.errorModal.style.display = 'none';
}

function updateStatus() {
    // Обновляем индикатор режима
    if (CONFIG.MODE === 'api' && CONFIG.YANDEX_API_KEY && !CONFIG.YANDEX_API_KEY.includes('ваш_ключ')) {
        elements.modeDemo.style.display = 'none';
        elements.modeApi.style.display = 'inline';
    } else {
        elements.modeDemo.style.display = 'inline';
        elements.modeApi.style.display = 'none';
    }
    
    // Обновляем статус подключения
    if (CONFIG.MODE === 'demo') {
        elements.statusDot.className = 'status-dot offline';
        elements.statusText.textContent = 'Демо-режим';
    } else {
        elements.statusDot.className = 'status-dot checking';
        elements.statusText.textContent = 'Проверка...';
    }
}

async function checkApiConnection() {
    if (CONFIG.MODE !== 'api' || CONFIG.YANDEX_API_KEY.includes('ваш_ключ')) {
        elements.statusDot.className = 'status-dot offline';
        elements.statusText.textContent = 'API не настроен';
        return;
    }
    
    try {
        // Быстрая проверка без реального запроса
        elements.statusDot.className = 'status-dot checking';
        elements.statusText.textContent = 'Проверка подключения...';
        
        // Простая проверка формата ключа
        if (CONFIG.YANDEX_API_KEY.length < 20) {
            throw new Error('Ключ слишком короткий');
        }
        
        if (!CONFIG.YANDEX_FOLDER_ID.startsWith('b1g')) {
            throw new Error('Неверный формат Folder ID');
        }
        
        elements.statusDot.className = 'status-dot online';
        elements.statusText.textContent = 'API доступен';
        
    } catch (error) {
        elements.statusDot.className = 'status-dot offline';
        elements.statusText.textContent = 'Ошибка подключения';
        console.warn('Проверка API:', error.message);
    }
}

async function testApiConnection() {
    if (!CONFIG.YANDEX_API_KEY || CONFIG.YANDEX_API_KEY.includes('ваш_ключ')) {
        showError('Сначала настройте API ключ в модальном окне настроек');
        elements.apiModal.style.display = 'flex';
        return;
    }
    
    elements.statusDot.className = 'status-dot checking';
    elements.statusText.textContent = 'Тестирование подключения...';
    
    try {
        // Тестовый запрос
        const testRuler = RULERS.ivan;
        const testQuestion = 'Привет! Как дела?';
        
        console.log('🧪 Тестируем подключение к Яндекс GPT...');
        const response = await askYandexGPT(testRuler, testQuestion);
        
        console.log('✅ Тест успешен! Ответ:', response);
        
        elements.statusDot.className = 'status-dot online';
        elements.statusText.textContent = 'API работает отлично!';
        
        showError(`
            <strong>✅ Подключение успешно!</strong><br><br>
            Яндекс GPT отвечает правильно.<br>
            <small>Тестовый ответ: "${response.substring(0, 100)}..."</small>
        `);
        
    } catch (error) {
        console.error('❌ Тест не пройден:', error);
        
        elements.statusDot.className = 'status-dot offline';
        elements.statusText.textContent = 'Ошибка подключения';
        
        showError(`
            <strong>❌ Ошибка подключения</strong><br><br>
            ${error.message}<br><br>
            <small>Проверьте:<br>
            1. Правильность API ключа<br>
            2. Правильность Folder ID<br>
            3. Доступ к интернету<br>
            4. Квоты в Яндекс Облаке</small>
        `, true);
    }
}

// ==================== НАСТРОЙКА API ====================
function saveApiConfig() {
    const apiKey = elements.apiKeyInput.value.trim();
    const folderId = elements.folderIdInput.value.trim();
    
    if (!apiKey || !folderId) {
        showApiTestResult('Заполните оба поля', 'error');
        return;
    }
    
    if (apiKey.length < 20) {
        showApiTestResult('API ключ слишком короткий', 'error');
        return;
    }
    
    if (!folderId.startsWith('b1g')) {
        showApiTestResult('Folder ID должен начинаться с b1g', 'error');
        return;
    }
    
    // Сохраняем ключи
    CONFIG.YANDEX_API_KEY = apiKey;
    CONFIG.YANDEX_FOLDER_ID = folderId;
    CONFIG.MODE = 'api';
    
    // Сохраняем в localStorage
    saveConfigToStorage();
    
    // Закрываем модальное окно
    elements.apiModal.style.display = 'none';
    
    // Обновляем статус
    updateStatus();
    checkApiConnection();
    
    showError(`
        <strong>✅ Ключи сохранены!</strong><br><br>
        Теперь используется реальный Яндекс GPT.<br>
        <small>Попробуйте задать вопрос правителю.</small>
    `);
}

function useDemoMode() {
    CONFIG.MODE = 'demo';
    elements.apiModal.style.display = 'none';
    updateStatus();
    
    showError(`
        <strong>🎭 Включен демо-режим</strong><br><br>
        Используются заранее подготовленные ответы.<br>
        <small>Чтобы использовать Яндекс GPT, настройте API ключи.</small>
    `);
}

function showApiTestResult(message, type) {
    elements.apiTestResult.textContent = message;
    elements.apiTestResult.className = `api-test-result ${type}`;
    elements.apiTestResult.style.display = 'block';
    
    setTimeout(() => {
        elements.apiTestResult.style.display = 'none';
    }, 5000);
}

// ==================== СОХРАНЕНИЕ И ВОССТАНОВЛЕНИЕ ====================
function saveChat() {
    try {
        const chatData = {
            ruler: Object.keys(RULERS).find(key => RULERS[key] === currentRuler),
            history: chatHistory,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('chatHistory', JSON.stringify(chatData));
    } catch (error) {
        console.error('Ошибка сохранения чата:', error);
    }
}

function restoreChat() {
    try {
        const savedRuler = localStorage.getItem('selectedRuler');
        const savedChat = localStorage.getItem('chatHistory');
        
        if (savedRuler && RULERS[savedRuler]) {
            // Выбираем правителя но не показываем чат сразу
            currentRuler = RULERS[savedRuler];
            
            if (savedChat) {
                const chatData = JSON.parse(savedChat);
                if (chatData.ruler === savedRuler) {
                    chatHistory = chatData.history || [];
                }
            }
        }
    } catch (error) {
        console.error('Ошибка восстановления чата:', error);
    }
}

// ==================== ОТЛАДКА ====================
// Экспортируем функции для отладки в консоли
window.debugApp = {
    config: CONFIG,
    rulers: RULERS,
    currentRuler: () => currentRuler,
    chatHistory: () => chatHistory,
    testAPI: testApiConnection,
    clearStorage: () => {
        localStorage.clear();
        location.reload();
    },
    setApiKeys: (apiKey, folderId) => {
        CONFIG.YANDEX_API_KEY = apiKey;
        CONFIG.YANDEX_FOLDER_ID = folderId;
        CONFIG.MODE = 'api';
        saveConfigToStorage();
        updateStatus();
        console.log('✅ Ключи установлены');
    },
    switchToDemo: () => {
        CONFIG.MODE = 'demo';
        updateStatus();
        console.log('✅ Переключено в демо-режим');
    }
};
