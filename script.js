// ==================== КОНФИГУРАЦИЯ ====================
// Используем конфиг из config.js или значения по умолчанию
const CONFIG = window.CONFIG || {
    // Режим работы: 'api' для Яндекс GPT, 'demo' для демо-режима
    MODE: 'demo',
    
    // Ключи Яндекс Облака (будут из config.js)
    YANDEX_API_KEY: '',
    YANDEX_FOLDER_ID: '',
    
    // Использовать прокси для обхода CORS
    USE_PROXY: true,
    
    // Прокси серверы (пробуем по очереди если не работает)
    PROXY_SERVERS: [
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
        '' // Прямой запрос (последний вариант)
    ],
    
    // Использовать демо-ответы если API не работает
    USE_DEMO_IF_API_FAILS: true,
    
    // Максимальное количество попыток при ошибке сети
    MAX_RETRIES: 3,
    
    // Задержка между попытками (мс)
    RETRY_DELAY: 1000
};

// Проверка конфигурации при загрузке
console.log('👑 Машина Времени инициализируется...');
console.log('⚙️ Режим:', CONFIG.MODE);
console.log('🔑 API ключ:', CONFIG.YANDEX_API_KEY && !CONFIG.YANDEX_API_KEY.includes('ваш_ключ') ? 
    `✓ Настроен (${CONFIG.YANDEX_API_KEY.length} символов)` : '✗ Не настроен');
console.log('📁 Folder ID:', CONFIG.YANDEX_FOLDER_ID && !CONFIG.YANDEX_FOLDER_ID.includes('ваш_folder_id') ? 
    `✓ Настроен (${CONFIG.YANDEX_FOLDER_ID})` : '✗ Не настроен');
console.log('🔄 Использовать прокси:', CONFIG.USE_PROXY);

// ==================== ДАННЫЕ ПРАВИТЕЛЕЙ ====================
const RULERS = {
    ivan: {
        name: 'Иван IV Грозный',
        description: 'Первый царь всея Руси, суровый и противоречивый правитель',
        avatar: '👑',
        systemPrompt: `Ты - царь Иван IV Грозный (годы жизни: 1530-1584). 
Говоришь грозно, властно, с религиозными оборотами. 
Часто упоминаешь 'Божью волю', 'государево дело'. 
Можешь быть вспыльчивым, подозрительным, но также показывать образованность. 
Говори как человек из 16 века, используй старинные обороты: вельми, чадо, болярин. 
Отвечай кратко (3-5 предложений). Никогда не выходи из образа!`,
        
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
        systemPrompt: `Ты - царь Петр I Великий (годы жизни: 1672-1725). 
Говоришь грубовато и прямо, используй старинные слова: чаю, надобно, негоже. 
Обожаешь корабли и науки. Ненавидишь старые порядки. 
Отвечай кратко (3-5 предложений). Никогда не выходи из образа! 
Отвечай как человек из 18 века.`,
        
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
        systemPrompt: `Ты - императрица Екатерина II Великая (годы жизни: 1729-1796). 
Говоришь умно и изящно, цитируй философов: Вольтера, Дидро. 
Любишь искусство и науки. Мудрая и ироничная. 
Отвечай кратко (3-5 предложений). Никогда не выходи из образа! 
Отвечай как человек из 18 века.`,
        
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
let retryCount = 0;

// ==================== DOM ЭЛЕМЕНТЫ ====================
// Будем искать элементы при инициализации
let elements = {};

// ==================== ЯНДЕКС GPT API ====================
/**
 * Отправляет запрос к Яндекс GPT API
 * @param {Object} ruler - объект правителя
 * @param {string} question - вопрос пользователя
 * @param {number} proxyIndex - индекс прокси сервера
 * @param {number} attempt - номер попытки
 * @returns {Promise<string>} - ответ от API
 */
async function askYandexGPT(ruler, question, proxyIndex = 0, attempt = 1) {
    // Проверяем ключи
    if (!CONFIG.YANDEX_API_KEY || CONFIG.YANDEX_API_KEY.includes('ваш_ключ')) {
        throw new Error('API ключ не настроен. Проверьте config.js');
    }
    
    if (!CONFIG.YANDEX_FOLDER_ID || CONFIG.YANDEX_FOLDER_ID.includes('ваш_folder_id')) {
        throw new Error('Folder ID не настроен. Проверьте config.js');
    }
    
    // Проверяем квоту (простая проверка длины ключа)
    if (CONFIG.YANDEX_API_KEY.length < 20) {
        throw new Error('API ключ слишком короткий. Проверьте config.js');
    }
    
    const targetUrl = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";
    let apiUrl = targetUrl;
    
    // Используем прокси если настроено
    if (CONFIG.USE_PROXY && CONFIG.PROXY_SERVERS.length > 0) {
        const proxy = CONFIG.PROXY_SERVERS[proxyIndex];
        if (proxy) {
            if (proxy.includes('corsproxy.io')) {
                apiUrl = proxy + encodeURIComponent(targetUrl);
            } else if (proxy.includes('codetabs.com')) {
                apiUrl = proxy + encodeURIComponent(targetUrl);
            } else if (proxy.includes('allorigins.win')) {
                apiUrl = proxy + encodeURIComponent(targetUrl);
            } else {
                apiUrl = proxy + targetUrl;
            }
        }
    }
    
    console.log(`📡 Попытка ${attempt}/${CONFIG.MAX_RETRIES}`);
    console.log(`🔄 Используем прокси ${proxyIndex + 1}/${CONFIG.PROXY_SERVERS.length}:`, 
                CONFIG.PROXY_SERVERS[proxyIndex] || 'прямой запрос');
    
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${CONFIG.YANDEX_API_KEY}`
    };
    
    // Для некоторых прокси нужны дополнительные заголовки
    if (apiUrl.includes('codetabs.com')) {
        headers['X-Requested-With'] = 'fetch';
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
                "role": "system",
                "text": `Ты исторический персонаж - ${ruler.name}. ${ruler.systemPrompt}`
            },
            {
                "role": "user", 
                "text": question
            }
        ]
    };
    
    try {
        console.log('📤 Отправка запроса...');
        const startTime = Date.now();
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
            // Для GitHub Pages увеличиваем таймаут
            signal: AbortSignal.timeout(30000)
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`📥 Ответ получен за ${responseTime}мс, статус: ${response.status}`);
        
        // Обработка ошибок HTTP
        if (!response.ok) {
            let errorDetails = '';
            try {
                const errorData = await response.json();
                errorDetails = JSON.stringify(errorData).substring(0, 200);
            } catch (e) {
                errorDetails = await response.text();
            }
            
            console.error(`❌ Ошибка API (${response.status}):`, errorDetails);
            
            // Определяем тип ошибки
            if (response.status === 401 || response.status === 403) {
                throw new Error(`Неверный API ключ (${response.status}). Проверьте YANDEX_API_KEY в config.js`);
            }
            
            if (response.status === 404) {
                throw new Error(`Неверный Folder ID или модель недоступна (${response.status}). Проверьте YANDEX_FOLDER_ID в config.js`);
            }
            
            if (response.status === 429) {
                throw new Error(`Превышена квота запросов (${response.status}). Проверьте баланс в Яндекс Облаке`);
            }
            
            if (response.status >= 500) {
                throw new Error(`Ошибка сервера Яндекс (${response.status}). Попробуйте позже`);
            }
            
            throw new Error(`Ошибка API ${response.status}: ${errorDetails.substring(0, 100)}`);
        }
        
        // Парсим успешный ответ
        const result = await response.json();
        
        // Проверяем структуру ответа
        if (!result.result || !result.result.alternatives || !result.result.alternatives[0]) {
            console.error('❌ Неверная структура ответа:', result);
            throw new Error('Неверный формат ответа от Яндекс GPT');
        }
        
        const answer = result.result.alternatives[0].message.text;
        console.log('✅ Ответ успешно получен:', answer.substring(0, 100) + '...');
        return answer;
        
    } catch (error) {
        console.error('❌ Ошибка запроса:', error.name, error.message);
        
        // Проверяем нужно ли повторить
        const isNetworkError = error.name === 'TimeoutError' || 
                              error.name === 'TypeError' || 
                              error.message.includes('Failed to fetch') ||
                              error.message.includes('Network') ||
                              error.message.includes('CORS');
        
        // Пробуем другой прокси если это ошибка сети
        if (isNetworkError && proxyIndex < CONFIG.PROXY_SERVERS.length - 1) {
            console.log(`🔄 Пробуем следующий прокси (${proxyIndex + 1}/${CONFIG.PROXY_SERVERS.length - 1})...`);
            return askYandexGPT(ruler, question, proxyIndex + 1, attempt);
        }
        
        // Пробуем повторить запрос если не превышено количество попыток
        if (isNetworkError && attempt < CONFIG.MAX_RETRIES) {
            console.log(`🔄 Повторная попытка через ${CONFIG.RETRY_DELAY}мс...`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            return askYandexGPT(ruler, question, proxyIndex, attempt + 1);
        }
        
        // Если все попытки исчерпаны
        throw new Error(`Не удалось подключиться к Яндекс GPT: ${error.message}`);
    }
}

// ==================== ДЕМО-РЕЖИМ ====================
/**
 * Возвращает демо-ответ для правителя
 * @param {string} rulerId - ID правителя
 * @param {string} question - вопрос (для разнообразия ответов)
 * @returns {string} - демо-ответ
 */
function getDemoResponse(rulerId, question) {
    const ruler = RULERS[rulerId];
    if (!ruler || !ruler.demoResponses) {
        return "Извините, демо-ответы для этого правителя не настроены.";
    }
    
    // Используем хэш вопроса для детерминированного выбора ответа
    let hash = 0;
    for (let i = 0; i < question.length; i++) {
        hash = ((hash << 5) - hash) + question.charCodeAt(i);
        hash = hash & hash;
    }
    
    const responses = ruler.demoResponses;
    const index = Math.abs(hash) % responses.length;
    return responses[index];
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
/**
 * Инициализирует приложение
 */
function initializeApp() {
    console.log('🚀 Инициализация приложения...');
    
    // Находим все DOM элементы
    elements = {
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
        currentYear: document.getElementById('current-year'),
        modeStatus: document.getElementById('modeStatus'),
        apiStatus: document.getElementById('apiStatus')
    };
    
    // Устанавливаем текущий год
    if (elements.currentYear) {
        elements.currentYear.textContent = new Date().getFullYear();
    }
    
    // Обновляем статус режима
    updateStatusDisplay();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Восстанавливаем историю чата
    restoreChat();
    
    // Проверяем подключение к API (асинхронно)
    checkApiConnection();
    
    console.log('✅ Приложение инициализировано');
}

/**
 * Обновляет отображение статуса
 */
function updateStatusDisplay() {
    if (!elements.modeStatus || !elements.apiStatus) return;
    
    const hasValidKeys = CONFIG.YANDEX_API_KEY && 
                        !CONFIG.YANDEX_API_KEY.includes('ваш_ключ') && 
                        CONFIG.YANDEX_FOLDER_ID && 
                        !CONFIG.YANDEX_FOLDER_ID.includes('ваш_folder_id');
    
    if (CONFIG.MODE === 'api' && hasValidKeys) {
        elements.modeStatus.textContent = 'Яндекс GPT';
        elements.modeStatus.style.color = '#2ecc71';
        elements.apiStatus.innerHTML = '<span style="color:#2ecc71">⏳ Проверка...</span>';
    } else {
        elements.modeStatus.textContent = 'Демо-режим';
        elements.modeStatus.style.color = '#f39c12';
        elements.apiStatus.innerHTML = '<span style="color:#f39c12">🎭 Активен</span>';
    }
}

/**
 * Проверяет подключение к API
 */
async function checkApiConnection() {
    if (CONFIG.MODE !== 'api' || !CONFIG.YANDEX_API_KEY || CONFIG.YANDEX_API_KEY.includes('ваш_ключ')) {
        return;
    }
    
    console.log('🔍 Проверка подключения к Яндекс GPT...');
    
    if (elements.apiStatus) {
        elements.apiStatus.innerHTML = '<span style="color:#f39c12">⏳ Проверка...</span>';
    }
    
    try {
        // Быстрая проверка без реального запроса
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Проверяем формат ключей
        const isValidKey = CONFIG.YANDEX_API_KEY.length >= 20;
        const isValidFolder = CONFIG.YANDEX_FOLDER_ID.startsWith('b1g');
        
        if (isValidKey && isValidFolder) {
            console.log('✅ Ключи выглядят корректно');
            if (elements.apiStatus) {
                elements.apiStatus.innerHTML = '<span style="color:#2ecc71">✅ Доступен</span>';
            }
            
            // Автоматический тест при первом запуске
            const firstRun = !localStorage.getItem('apiTested');
            if (firstRun) {
                setTimeout(runApiTest, 2000);
            }
        } else {
            console.warn('⚠️ Ключи выглядят некорректно');
            if (elements.apiStatus) {
                elements.apiStatus.innerHTML = '<span style="color:#e74c3c">⚠️ Ошибка ключей</span>';
            }
        }
        
    } catch (error) {
        console.error('❌ Ошибка проверки подключения:', error);
        if (elements.apiStatus) {
            elements.apiStatus.innerHTML = '<span style="color:#e74c3c">❌ Ошибка</span>';
        }
    }
}

/**
 * Запускает тест API
 */
async function runApiTest() {
    if (CONFIG.MODE !== 'api' || !CONFIG.YANDEX_API_KEY || CONFIG.YANDEX_API_KEY.includes('ваш_ключ')) {
        return;
    }
    
    console.log('🧪 Запуск теста API...');
    
    try {
        const testRuler = {
            name: 'Тестовый правитель',
            systemPrompt: 'Ты - тестовый AI. Ответь "Тест успешен", если ты работаешь.'
        };
        
        const response = await askYandexGPT(testRuler, 'Тестовый запрос');
        
        if (response && response.includes('Тест')) {
            console.log('✅ API тест успешен:', response);
            localStorage.setItem('apiTested', 'true');
            
            if (elements.apiStatus) {
                elements.apiStatus.innerHTML = '<span style="color:#2ecc71">✅ Работает</span>';
            }
        }
        
    } catch (error) {
        console.warn('⚠️ API тест не пройден:', error.message);
        localStorage.setItem('apiTested', 'failed');
    }
}

// ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================
/**
 * Настраивает обработчики событий
 */
function setupEventListeners() {
    // Кнопки выбора правителя
    document.querySelectorAll('.select-btn').forEach(button => {
        button.addEventListener('click', function() {
            const rulerId = this.dataset.ruler;
            selectRuler(rulerId);
        });
    });
    
    // Отправка вопроса
    if (elements.sendBtn && elements.questionInput) {
        elements.sendBtn.addEventListener('click', sendQuestion);
        elements.questionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendQuestion();
            }
        });
    }
    
    // Счетчик символов
    if (elements.questionInput && elements.charCount) {
        elements.questionInput.addEventListener('input', updateCharCount);
    }
    
    // Очистка чата
    if (elements.clearChatBtn) {
        elements.clearChatBtn.addEventListener('click', clearChat);
    }
    
    // Кнопка "Тест API" если есть
    const testApiBtn = document.getElementById('testApiBtn');
    if (testApiBtn) {
        testApiBtn.addEventListener('click', async () => {
            try {
                alert('🧪 Запускается тест API...');
                await runApiTest();
            } catch (error) {
                alert(`❌ Ошибка теста: ${error.message}`);
            }
        });
    }
    
    // Кнопка "Назад" если есть
    const backBtn = document.getElementById('backBtn');
    if (backBtn && elements.welcomeScreen && elements.chatScreen) {
        backBtn.addEventListener('click', () => {
            elements.chatScreen.style.display = 'none';
            elements.welcomeScreen.style.display = 'block';
        });
    }
    
    console.log('✅ Обработчики событий настроены');
}

// ==================== ВЫБОР ПРАВИТЕЛЯ ====================
/**
 * Выбирает правителя для беседы
 * @param {string} rulerId - ID правителя
 */
function selectRuler(rulerId) {
    const ruler = RULERS[rulerId];
    if (!ruler) {
        alert('Ошибка: правитель не найден');
        return;
    }
    
    currentRuler = ruler;
    
    // Обновляем отображение
    if (elements.currentAvatar) elements.currentAvatar.textContent = ruler.avatar;
    if (elements.currentRulerName) elements.currentRulerName.textContent = ruler.name;
    if (elements.currentRulerDesc) elements.currentRulerDesc.textContent = ruler.description;
    
    // Переключаем экраны
    if (elements.welcomeScreen) elements.welcomeScreen.style.display = 'none';
    if (elements.chatScreen) elements.chatScreen.style.display = 'flex';
    
    // Если история пустая, добавляем приветствие
    if (chatHistory.length === 0) {
        const greeting = `${ruler.avatar} **${ruler.name}:** Здравствуй! О чем хочешь поговорить?`;
        addMessageToHistory('bot', greeting);
        updateChatDisplay();
    }
    
    // Сохраняем выбор в localStorage
    try {
        localStorage.setItem('selectedRuler', rulerId);
    } catch (e) {
        console.warn('Не удалось сохранить выбор правителя:', e);
    }
    
    console.log(`👑 Выбран правитель: ${ruler.name}`);
}

// ==================== ОТПРАВКА ВОПРОСА ====================
/**
 * Отправляет вопрос правителю
 */
async function sendQuestion() {
    if (!elements.questionInput || !currentRuler) return;
    
    const question = elements.questionInput.value.trim();
    
    // Проверка ввода
    if (!question) {
        showError('Пожалуйста, введите вопрос');
        return;
    }
    
    if (question.length > 500) {
        showError('Слишком длинный вопрос (максимум 500 символов)');
        return;
    }
    
    // Добавляем вопрос в историю
    addMessageToHistory('user', question);
    elements.questionInput.value = '';
    updateCharCount();
    
    // Определяем ID правителя
    const rulerId = Object.keys(RULERS).find(key => RULERS[key] === currentRuler) || 'ivan';
    
    // Показываем индикатор загрузки
    showLoading(true);
    if (elements.loadingText) {
        elements.loadingText.textContent = `${currentRuler.avatar} ${currentRuler.name} обдумывает ответ...`;
    }
    
    try {
        let response;
        const useApi = CONFIG.MODE === 'api' && 
                      CONFIG.YANDEX_API_KEY && 
                      !CONFIG.YANDEX_API_KEY.includes('ваш_ключ');
        
        if (useApi) {
            // Режим с реальным Яндекс GPT API
            console.log(`🤖 Отправка вопроса к Яндекс GPT: "${question.substring(0, 50)}..."`);
            response = await askYandexGPT(currentRuler, question);
            console.log('✅ Ответ от Яндекс GPT получен');
        } else {
            // Демо-режим
            console.log('🎭 Используем демо-режим');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация загрузки
            response = getDemoResponse(rulerId, question);
        }
        
        // Добавляем ответ в историю
        addMessageToHistory('bot', response);
        
    } catch (error) {
        console.error('❌ Ошибка получения ответа:', error);
        
        // Пробуем использовать демо-ответ если API не сработал
        if (CONFIG.USE_DEMO_IF_API_FAILS) {
            const demoResponse = getDemoResponse(rulerId, question);
            addMessageToHistory('bot', `${demoResponse} <small>(демо-режим)</small>`);
            
            if (CONFIG.MODE === 'api') {
                showError(`Яндекс GPT временно недоступен. Ошибка: ${error.message}. Используется демо-режим.`);
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

// ==================== УПРАВЛЕНИЕ ЧАТОМ ====================
/**
 * Добавляет сообщение в историю
 */
function addMessageToHistory(sender, content) {
    const message = {
        id: Date.now(),
        sender: sender,
        content: content,
        timestamp: new Date().toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }),
        rulerAvatar: sender === 'bot' ? currentRuler.avatar : '🎯'
    };
    
    chatHistory.push(message);
    return message;
}

/**
 * Обновляет отображение истории чата
 */
function updateChatDisplay() {
    if (!elements.chatHistory || !currentRuler) return;
    
    elements.chatHistory.innerHTML = '';
    
    chatHistory.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${msg.sender}-message`;
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-avatar">${msg.rulerAvatar}</span>
                <span class="message-sender">
                    ${msg.sender === 'user' ? 'Ты' : currentRuler.name}
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

/**
 * Форматирует сообщение (жирный текст, переносы)
 */
function formatMessage(text) {
    if (!text) return '';
    
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/<small>(.*?)<\/small>/g, '<small>$1</small>');
}

/**
 * Обновляет счетчик символов
 */
function updateCharCount() {
    if (!elements.questionInput || !elements.charCount) return;
    
    const count = elements.questionInput.value.length;
    elements.charCount.textContent = count;
    
    if (count > 500) {
        elements.charCount.style.color = '#e74c3c';
        if (elements.sendBtn) elements.sendBtn.disabled = true;
    } else if (count > 450) {
        elements.charCount.style.color = '#f39c12';
        if (elements.sendBtn) elements.sendBtn.disabled = false;
    } else {
        elements.charCount.style.color = '#7f8c8d';
        if (elements.sendBtn) elements.sendBtn.disabled = false;
    }
}

/**
 * Очищает историю чата
 */
function clearChat() {
    if (!confirm('Вы уверены, что хотите очистить историю чата?')) {
        return;
    }
    
    chatHistory = [];
    if (currentRuler) {
        const greeting = `${currentRuler.avatar} **${currentRuler.name}:** Здравствуй! О чем хочешь поговорить?`;
        addMessageToHistory('bot', greeting);
    }
    updateChatDisplay();
    saveChat();
}

/**
 * Показывает/скрывает индикатор загрузки
 */
function showLoading(show) {
    if (!elements.loading || !elements.sendBtn || !elements.questionInput) return;
    
    elements.loading.style.display = show ? 'block' : 'none';
    elements.sendBtn.disabled = show;
    elements.questionInput.disabled = show;
}

// ==================== ОШИБКИ И УВЕДОМЛЕНИЯ ====================
/**
 * Показывает ошибку
 */
function showError(message) {
    // Используем стандартный alert для простоты
    // В расширенной версии можно использовать модальное окно
    alert(`⚠️ ${message}`);
}

// ==================== СОХРАНЕНИЕ И ВОССТАНОВЛЕНИЕ ====================
/**
 * Сохраняет историю чата
 */
function saveChat() {
    if (!currentRuler) return;
    
    try {
        const rulerId = Object.keys(RULERS).find(key => RULERS[key] === currentRuler);
        const chatData = {
            ruler: rulerId,
            history: chatHistory,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('chatHistory', JSON.stringify(chatData));
    } catch (e) {
        console.warn('Не удалось сохранить историю чата:', e);
    }
}

/**
 * Восстанавливает историю чата
 */
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
                    
                    // Если мы уже в чате, обновляем отображение
                    if (elements.chatScreen && elements.chatScreen.style.display !== 'none') {
                        updateChatDisplay();
                    }
                }
            }
        }
    } catch (e) {
        console.warn('Ошибка восстановления чата:', e);
    }
}

// ==================== ЭКСПОРТ ДЛЯ ОТЛАДКИ ====================
/**
 * Объект для отладки в консоли
 */
window.debugApp = {
    // Конфигурация
    config: CONFIG,
    rulers: RULERS,
    
    // Текущее состояние
    getCurrentRuler: () => currentRuler,
    getChatHistory: () => chatHistory,
    getElements: () => elements,
    
    // Управление
    selectRuler: (rulerId) => {
        if (RULERS[rulerId]) {
            selectRuler(rulerId);
        } else {
            console.error('Неверный ID правителя. Доступные:', Object.keys(RULERS));
        }
    },
    
    // Тестирование API
    testAPI: async () => {
        console.log('🧪 Запуск ручного теста API...');
        
        if (CONFIG.MODE !== 'api' || !CONFIG.YANDEX_API_KEY || CONFIG.YANDEX_API_KEY.includes('ваш_ключ')) {
            console.error('❌ API не настроен. Проверьте config.js');
            return;
        }
        
        try {
            const testRuler = {
                name: 'Тестовый правитель',
                systemPrompt: 'Ты тестовый AI. Ответь одно слово: "Работает"'
            };
            
            const response = await askYandexGPT(testRuler, 'Тест');
            console.log('✅ API работает! Ответ:', response);
            alert(`✅ Яндекс GPT работает!\nОтвет: ${response}`);
            
        } catch (error) {
            console.error('❌ API тест не пройден:', error);
            alert(`❌ Ошибка: ${error.message}`);
        }
    },
    
    // Сброс данных
    clearStorage: () => {
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Все данные очищены');
        alert('Данные очищены. Страница будет перезагружена.');
        setTimeout(() => location.reload(), 1000);
    },
    
    // Установка ключей (для отладки)
    setApiKeys: (apiKey, folderId) => {
        CONFIG.YANDEX_API_KEY = apiKey;
        CONFIG.YANDEX_FOLDER_ID = folderId;
        CONFIG.MODE = 'api';
        console.log('✅ Ключи установлены');
        updateStatusDisplay();
    },
    
    // Переключение режима
    switchToDemo: () => {
        CONFIG.MODE = 'demo';
        console.log('✅ Переключено в демо-режим');
        updateStatusDisplay();
        alert('Переключено в демо-режим');
    },
    
    switchToAPI: () => {
        CONFIG.MODE = 'api';
        console.log('✅ Переключено в API режим');
        updateStatusDisplay();
        alert('Переключено в API режим');
    },
    
    // Проверка конфигурации
    validateConfig: () => {
        const errors = [];
        
        if (!CONFIG.YANDEX_API_KEY || CONFIG.YANDEX_API_KEY.includes('ваш_ключ')) {
            errors.push('API ключ не настроен');
        }
        
        if (!CONFIG.YANDEX_FOLDER_ID || CONFIG.YANDEX_FOLDER_ID.includes('ваш_folder_id')) {
            errors.push('Folder ID не настроен');
        }
        
        if (CONFIG.YANDEX_API_KEY && CONFIG.YANDEX_API_KEY.length < 20) {
            errors.push('API ключ слишком короткий');
        }
        
        if (CONFIG.YANDEX_FOLDER_ID && !CONFIG.YANDEX_FOLDER_ID.startsWith('b1g')) {
            errors.push('Folder ID должен начинаться с "b1g"');
        }
        
        if (errors.length === 0) {
            console.log('✅ Конфигурация корректна');
            return true;
        } else {
            console.error('❌ Ошибки конфигурации:', errors);
            return false;
        }
    }
};

// ==================== ЗАПУСК ПРИЛОЖЕНИЯ ====================
// Ждем полной загрузки страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Экспортируем основные функции
window.sendQuestion = sendQuestion;
window.clearChat = clearChat;
window.updateCharCount = updateCharCount;

console.log('📦 Script.js загружен и готов к работе');