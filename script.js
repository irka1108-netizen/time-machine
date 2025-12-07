// Конфигурация для GitHub Pages с Яндекс GPT
const CONFIG = {
    // Режим работы: 'api' - реальный Яндекс GPT, 'demo' - демо-режим
    MODE: 'api',  // ← ИЗМЕНИТЕ НА 'api' для Яндекс GPT
    
    // ВАШИ КЛЮЧИ ОТ ЯНДЕКС ОБЛАКА (замените на свои!):
    YANDEX_API_KEY: 'AQVN...ваш_ключ_здесь...',  // ← ВСТАВЬТЕ СВОЙ КЛЮЧ
    YANDEX_FOLDER_ID: 'b1g...ваш_folder_id...',  // ← ВСТАВЬТЕ СВОЙ FOLDER_ID
    
    // Использовать демо-ответы если API не работает
    USE_DEMO_IF_API_FAILS: true,
    
    // Прокси для обхода CORS (если нужен)
    USE_PROXY: true,
    PROXY_URL: 'https://api.allorigins.win/raw?url='
};

// Системные промпты для правителей
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
Отвечай кратко (3-5 предложений). Никогда не выходи из образа!

Примеры твоих ответов:
- "Вельми дивный вопрос задаешь, чадо! По Божьей воле и государеву делу..."
- "Чадо, спрашиваешь о делах государственных? Все делалось для укрепления царства Московского!"
- "Вопрос твой вельми любопытен. Как царь всея Руси, я должен был..."`,
        
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
Отвечай как человек из 18 века.

Примеры твоих ответов:
- "Эх, молодец, что спрашиваешь! Надобно было Русь к морю повернуть..."
- "Так, слушай! Все для пользы государства делал. Корабли строил, науки развивал!"
- "Чаю, вопрос разумный! Прогресс и развитие - вот что важно для державы!"`,
        
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
Отвечай как человек из 18 века.

Примеры твоих ответов:
- "Мой друг, как приятно беседовать с просвещенным человеком! Как говаривал Вольтер..."
- "Искусство управлять - это искусство просвещать. Я, как истинная дочь эпохи Просвещения..."
- "Прекрасный вопрос! Умение слушать философов и учиться у них - признак мудрого правителя..."`,
        
        demoResponses: [
            "Мой друг, как приятно беседовать с просвещенным человеком! Просвещенный абсолютизм — это когда монарх правит для блага подданных, следуя разуму.",
            "С философами переписывалась, ибо считала: правитель должен быть образован! Как говаривал Вольтер, невежество — мать всех пороков.",
            "Прекрасный вопрос! Искусство и науки украшают государство. Умный правитель должен покровительствовать просвещению."
        ]
    }
};

// Глобальные переменные
let currentRuler = null;
let chatHistory = [];

// DOM элементы
const welcomeScreen = document.getElementById('welcome-screen');
const chatScreen = document.getElementById('chat-screen');
const currentAvatar = document.getElementById('current-avatar');
const currentRulerName = document.getElementById('current-ruler-name');
const currentRulerDesc = document.getElementById('current-ruler-desc');
const chatHistoryElement = document.getElementById('chat-history');
const questionInput = document.getElementById('question-input');
const sendBtn = document.getElementById('send-btn');
const charCount = document.getElementById('char-count');
const clearChatBtn = document.getElementById('clear-chat');
const loadingElement = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');
const errorModal = document.getElementById('error-modal');
const errorMessage = document.getElementById('error-message');
const closeErrorBtn = document.getElementById('close-error-btn');
const closeModalBtn = document.querySelector('.close-modal');
const currentYear = document.getElementById('current-year');

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

document.addEventListener('DOMContentLoaded', function() {
    // Устанавливаем текущий год в футере
    currentYear.textContent = new Date().getFullYear();
    
    // Назначаем обработчики событий
    setupEventListeners();
    
    // Восстанавливаем историю чата из localStorage
    restoreChat();
    
    // Проверяем конфигурацию
    checkConfiguration();
});

// Проверка конфигурации
function checkConfiguration() {
    if (CONFIG.MODE === 'api') {
        if (!CONFIG.YANDEX_API_KEY || CONFIG.YANDEX_API_KEY.includes('ваш_ключ')) {
            showError(`
                <strong>⚠️ Яндекс API ключ не настроен!</strong><br><br>
                Чтобы использовать реальный Яндекс GPT:<br>
                1. Получите API ключ в <a href="https://cloud.yandex.ru/" target="_blank">Яндекс Облаке</a><br>
                2. Замените ключи в файле script.js:<br>
                <code>YANDEX_API_KEY: 'ваш_ключ_здесь'</code><br>
                <code>YANDEX_FOLDER_ID: 'ваш_folder_id_здесь'</code><br><br>
                <small>Сейчас используется демо-режим.</small>
            `, true);
            
            // Автоматически переключаем в демо-режим
            CONFIG.MODE = 'demo';
        }
    }
    
    console.log(`⚙️ Режим: ${CONFIG.MODE === 'api' ? 'Яндекс GPT API' : 'Демо'}`);
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
    sendBtn.addEventListener('click', sendQuestion);
    questionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendQuestion();
        }
    });
    
    // Счетчик символов
    questionInput.addEventListener('input', updateCharCount);
    
    // Очистка чата
    clearChatBtn.addEventListener('click', clearChat);
    
    // Модальное окно ошибки
    closeErrorBtn.addEventListener('click', closeErrorModal);
    closeModalBtn.addEventListener('click', closeErrorModal);
    window.addEventListener('click', function(e) {
        if (e.target === errorModal) {
            closeErrorModal();
        }
    });
}

// ==================== ВЫБОР ПРАВИТЕЛЯ ====================

function selectRuler(rulerId) {
    currentRuler = RULERS[rulerId];
    
    // Обновляем отображение
    currentAvatar.textContent = currentRuler.avatar;
    currentRulerName.textContent = currentRuler.name;
    currentRulerDesc.textContent = currentRuler.description;
    
    // Переключаем экраны
    welcomeScreen.style.display = 'none';
    chatScreen.style.display = 'flex';
    
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
    const question = questionInput.value.trim();
    
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
    questionInput.value = '';
    updateCharCount();
    
    // Показываем индикатор загрузки
    showLoading(true);
    loadingText.textContent = `${currentRuler.avatar} ${currentRuler.name} обдумывает ответ...`;
    
    // Имитируем небольшую задержку для реалистичности
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
        let response;
        
        if (CONFIG.MODE === 'api') {
            // Режим с реальным Яндекс GPT API
            response = await askYandexGPT(currentRuler, question);
        } else {
            // Демо-режим
            response = getDemoResponse(currentRuler, question);
        }
        
        // Добавляем ответ в историю
        addMessageToHistory('bot', response);
        
    } catch (error) {
        console.error('Ошибка получения ответа:', error);
        
        // Пробуем использовать демо-ответ если API не сработал
        if (CONFIG.USE_DEMO_IF_API_FAILS) {
            const demoResponse = getDemoResponse(currentRuler, question);
            addMessageToHistory('bot', `⚠️ ${demoResponse} <small>(демо-ответ)</small>`);
            showError('Яндекс GPT временно недоступен. Используется демо-режим.');
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

async function askYandexGPT(ruler, question) {
    // Проверяем ключи
    if (!CONFIG.YANDEX_API_KEY || !CONFIG.YANDEX_FOLDER_ID) {
        throw new Error('API ключи не настроены. Проверьте CONFIG в script.js');
    }
    
    const targetUrl = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";
    let requestUrl = targetUrl;
    
    // Используем прокси если включено
    if (CONFIG.USE_PROXY) {
        requestUrl = CONFIG.PROXY_URL + encodeURIComponent(targetUrl);
    }
    
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${CONFIG.YANDEX_API_KEY}`
    };
    
    const data = {
        "modelUri": `gpt://${CONFIG.YANDEX_FOLDER_ID}/yandexgpt-lite`,
        "completionOptions": {
            "stream": false,
            "temperature": 0.7,
            "maxTokens": 1000
        },
        "messages": [
            {
                "role": "user",
                "text": `${ruler.systemPrompt}\n\nВопрос от ученика: ${question}\n\nОтветь как ${ruler.name}:`
            }
        ]
    };
    
    console.log('📡 Отправляем запрос к Яндекс GPT...');
    
    try {
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
            mode: CONFIG.USE_PROXY ? 'cors' : 'no-cors'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Ошибка Яндекс API:', response.status, errorText);
            
            if (response.status === 401) {
                throw new Error('Неверный API ключ. Проверьте CONFIG.YANDEX_API_KEY');
            } else if (response.status === 404) {
                throw new Error('Неверный Folder ID. Проверьте CONFIG.YANDEX_FOLDER_ID');
            } else {
                throw new Error(`Ошибка Яндекс API (${response.status}): ${errorText.substring(0, 100)}`);
            }
        }
        
        const result = await response.json();
        console.log('✅ Получен ответ от Яндекс GPT');
        
        // Проверяем структуру ответа
        if (!result.result || !result.result.alternatives || !result.result.alternatives[0]) {
            console.error('Неверная структура ответа:', result);
            throw new Error('Неверный формат ответа от Яндекс GPT');
        }
        
        return result.result.alternatives[0].message.text;
        
    } catch (error) {
        console.error('❌ Ошибка запроса к Яндекс GPT:', error);
        
        // Пробуем альтернативный прокси если первый не сработал
        if (CONFIG.USE_PROXY && error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            console.log('Пробуем альтернативный прокси...');
            CONFIG.PROXY_URL = 'https://corsproxy.io/?';
            return askYandexGPT(ruler, question); // Рекурсивный вызов с новым прокси
        }
        
        throw error;
    }
}

// ==================== ДЕМО-РЕЖИМ ====================

function getDemoResponse(ruler, question) {
    const responses = ruler.demoResponses;
    
    // Выбираем ответ на основе хэша вопроса для консистентности
    const questionHash = hashString(question);
    const responseIndex = questionHash % responses.length;
    
    return responses[responseIndex];
}

// Простая хэш-функция
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash);
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
        rulerAvatar: sender === 'bot' ? currentRuler.avatar : '🎯'
    };
    
    chatHistory.push(message);
    return message;
}

function updateChatDisplay() {
    chatHistoryElement.innerHTML = '';
    
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
        
        chatHistoryElement.appendChild(messageElement);
    });
    
    // Прокручиваем вниз
    chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
}

function formatMessage(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/<small>(.*?)<\/small>/g, '<small>$1</small>');
}

function updateCharCount() {
    const count = questionInput.value.length;
    charCount.textContent = count;
    
    if (count > 500) {
        charCount.style.color = '#e74c3c';
        sendBtn.disabled = true;
    } else if (count > 400) {
        charCount.style.color = '#f39c12';
        sendBtn.disabled = false;
    } else {
        charCount.style.color = '#7f8c8d';
        sendBtn.disabled = false;
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
    loadingElement.style.display = show ? 'block' : 'none';
    sendBtn.disabled = show;
    questionInput.disabled = show;
}

function showError(message, isHtml = false) {
    if (isHtml) {
        errorMessage.innerHTML = message;
    } else {
        errorMessage.textContent = message;
    }
    errorModal.style.display = 'flex';
}

function closeErrorModal() {
    errorModal.style.display = 'none';
}

// ==================== СОХРАНЕНИЕ И ВОССТАНОВЛЕНИЕ ====================

function saveChat() {
    const chatData = {
        ruler: Object.keys(RULERS).find(key => RULERS[key] === currentRuler),
        history: chatHistory,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('chatHistory', JSON.stringify(chatData));
}

function restoreChat() {
    const savedRuler = localStorage.getItem('selectedRuler');
    const savedChat = localStorage.getItem('chatHistory');
    
    if (savedRuler && RULERS[savedRuler]) {
        selectRuler(savedRuler);
        
        if (savedChat) {
            try {
                const chatData = JSON.parse(savedChat);
                if (chatData.ruler === savedRuler) {
                    chatHistory = chatData.history || [];
                    updateChatDisplay();
                }
            } catch (e) {
                console.error('Ошибка восстановления чата:', e);
                localStorage.removeItem('chatHistory');
            }
        }
    }
}

// ==================== ЭКСПОРТ ДЛЯ ОТЛАДКИ ====================

// Для отладки в консоли
window.debugChat = {
    getConfig: () => CONFIG,
    getCurrentRuler: () => currentRuler,
    getChatHistory: () => chatHistory,
    clearStorage: () => {
        localStorage.clear();
        location.reload();
    },
    testAPI: async () => {
        if (!currentRuler) {
            alert('Сначала выберите правителя');
            return;
        }
        const testQuestion = 'Привет! Как дела?';
        console.log('Тестируем API с вопросом:', testQuestion);
        try {
            const response = await askYandexGPT(currentRuler, testQuestion);
            console.log('✅ API работает! Ответ:', response);
            alert('API работает! Проверьте консоль для ответа.');
        } catch (error) {
            console.error('❌ API не работает:', error);
            alert('API не работает: ' + error.message);
        }
    }
};

console.log('👑 Машина Времени загружена!');
console.log('Для отладки используйте debugChat в консоли');