// Конфигурация для GitHub Pages
const CONFIG = {
    // Режим работы: 'api' или 'demo'
    MODE: 'demo',
    
    // Для режима 'api' - вставьте свои ключи:
    YANDEX_API_KEY: 'AQVN0ZcLew0gqWKyFZWMKN7RUTVP8YnzX8oEVydv',
    YANDEX_FOLDER_ID: 'b1gof6m2ru5t8pqmchi9',
    
    // Для режима 'demo' - использовать демо-ответы
    USE_DEMO: true
};

const RULERS = {
    ivan: {
        name: 'Иван IV Грозный',
        description: 'Первый царь всея Руси, суровый и противоречивый правитель',
        avatar: '👑',
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
        demoResponses: [
            "Мой друг, как приятно беседовать с просвещенным человеком! Просвещенный абсолютизм — это когда монарх правит для блага подданных, следуя разуму.",
            "С философами переписывалась, ибо считала: правитель должен быть образован! Как говаривал Вольтер, невежество — мать всех пороков.",
            "Прекрасный вопрос! Искусство и науки украшают государство. Умный правитель должен покровительствовать просвещению."
        ]
    }
};

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

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    currentYear.textContent = new Date().getFullYear();
    setupEventListeners();
    restoreChat();
    
    // Показываем информацию о режиме
    if (CONFIG.MODE === 'demo') {
        console.log('⚙️ Режим: Демо (ответы заранее подготовлены)');
        console.log('💡 Чтобы включить Яндекс GPT, установите CONFIG.MODE = "api" и добавьте ключи');
    }
});

// Настройка обработчиков
function setupEventListeners() {
    document.querySelectorAll('.select-btn').forEach(button => {
        button.addEventListener('click', function() {
            const rulerId = this.dataset.ruler;
            selectRuler(rulerId);
        });
    });
    
    sendBtn.addEventListener('click', sendQuestion);
    questionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendQuestion();
        }
    });
    
    questionInput.addEventListener('input', updateCharCount);
    clearChatBtn.addEventListener('click', clearChat);
    closeErrorBtn.addEventListener('click', closeErrorModal);
    closeModalBtn.addEventListener('click', closeErrorModal);
    window.addEventListener('click', function(e) {
        if (e.target === errorModal) {
            closeErrorModal();
        }
    });
}

// Выбор правителя
function selectRuler(rulerId) {
    currentRuler = RULERS[rulerId];
    
    currentAvatar.textContent = currentRuler.avatar;
    currentRulerName.textContent = currentRuler.name;
    currentRulerDesc.textContent = currentRuler.description;
    
    welcomeScreen.style.display = 'none';
    chatScreen.style.display = 'flex';
    
    if (chatHistory.length === 0) {
        const greeting = `${currentRuler.avatar} **${currentRuler.name}:** Здравствуй! О чем хочешь поговорить?`;
        addMessageToHistory('bot', greeting);
        updateChatDisplay();
    }
    
    localStorage.setItem('selectedRuler', rulerId);
}

// Отправка вопроса
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
    
    // Имитируем задержку для реалистичности
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
        let response;
        
        if (CONFIG.MODE === 'api' && CONFIG.YANDEX_API_KEY && CONFIG.YANDEX_FOLDER_ID) {
            // Режим с реальным API
            response = await askYandexGPT(currentRuler, question);
        } else {
            // Демо-режим
            response = getDemoResponse(currentRuler, question);
        }
        
        // Добавляем ответ в историю
        addMessageToHistory('bot', response);
        
    } catch (error) {
        console.error('Ошибка:', error);
        // Если API не работает, используем демо-ответ
        const demoResponse = getDemoResponse(currentRuler, question);
        addMessageToHistory('bot', demoResponse);
    } finally {
        showLoading(false);
        updateChatDisplay();
        saveChat();
    }
}

// Функция для запроса к Яндекс GPT API (если включен API режим)
async function askYandexGPT(ruler, question) {
    if (!CONFIG.YANDEX_API_KEY || !CONFIG.YANDEX_FOLDER_ID) {
        throw new Error('API ключи не настроены');
    }
    
    const url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";
    
    // Определяем системный промпт в зависимости от правителя
    let systemPrompt;
    if (ruler.name === 'Иван IV Грозный') {
        systemPrompt = "Ты - царь Иван IV Грозный. Говоришь грозно, властно, с религиозными оборотами.";
    } else if (ruler.name === 'Петр I Великий') {
        systemPrompt = "Ты - царь Петр I Великий. Говоришь грубовато и прямо, любишь корабли и науки.";
    } else {
        systemPrompt = "Ты - императрица Екатерина II Великая. Говоришь умно и изящно, любишь искусство.";
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
                "text": `${systemPrompt}\n\nВопрос от ученика: ${question}`
            }
        ]
    };
    
    // Используем CORS прокси для GitHub Pages
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const response = await fetch(proxyUrl + encodeURIComponent(url), {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
    }
    
    const result = await response.json();
    return result.result.alternatives[0].message.text;
}

// Демо-ответы
function getDemoResponse(ruler, question) {
    const responses = ruler.demoResponses;
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
}

// Остальные функции (такие же как раньше)
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
    
    chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
}

function formatMessage(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
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

function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = 'flex';
}

function closeErrorModal() {
    errorModal.style.display = 'none';
}

function saveChat() {
    const chatData = {
        ruler: Object.keys(RULERS).find(key => RULERS[key] === currentRuler),
        history: chatHistory
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
            }
        }
    }
}