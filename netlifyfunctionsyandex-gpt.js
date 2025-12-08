const axios = require('axios');

exports.handler = async function(event, context) {
    // Разрешаем CORS
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    
    // Обработка OPTIONS запроса для CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    // Только POST запросы
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Метод не разрешен. Используйте POST.' })
        };
    }
    
    try {
        // Парсим данные из запроса
        let data;
        try {
            data = JSON.parse(event.body);
        } catch (parseError) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Неверный формат JSON в теле запроса',
                    details: parseError.message 
                })
            };
        }
        
        const { question, ruler } = data;
        
        // Проверяем обязательные поля
        if (!question || !ruler) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Отсутствуют обязательные поля',
                    required: ['question', 'ruler'],
                    received: { question: !!question, ruler: !!ruler }
                })
            };
        }
        
        console.log('📨 Получен запрос для правителя:', ruler);
        console.log('Вопрос:', question.substring(0, 100) + '...');
        
        // Получаем ключи из переменных окружения Netlify
        const YANDEX_API_KEY = process.env.YANDEX_API_KEY;
        const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID;
        
        // Проверяем наличие ключей
        if (!YANDEX_API_KEY) {
            console.error('❌ YANDEX_API_KEY не найден в переменных окружения');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'API ключ не настроен на сервере',
                    message: 'Пожалуйста, проверьте настройки Netlify'
                })
            };
        }
        
        if (!YANDEX_FOLDER_ID) {
            console.error('❌ YANDEX_FOLDER_ID не найден');
        }
        
        // Определяем имя правителя для промпта
        const rulerNames = {
            ivan: 'Иван IV Грозный, царь всея Руси (1530-1584)',
            peter: 'Пётр I Великий, император Всероссийский (1672-1725)',
            catherine: 'Екатерина II Великая, императрица Всероссийская (1729-1796)',
            alexander: 'Александр I Благословенный, император Всероссийский (1777-1825)'
        };
        
        const rulerName = rulerNames[ruler] || 'Исторический правитель России';
        
        // Формируем промпт для Яндекса
        const systemPrompt = `Ты - ${rulerName}. Отвечай на вопросы от первого лица, как будто ты действительно этот исторический правитель. 
        Используй язык и стиль речи, соответствующий твоей эпохе. 
        Будь немного театральным и харизматичным, но сохраняй историческую точность.
        Если вопрос не связан с твоим правлением или историческим контекстом, вежливо откажись отвечать, объяснив свою позицию.
        Длина ответа: 3-5 предложений.`;
        
        // Отправляем запрос к Яндекс GPT
        console.log('🔄 Отправка запроса к Яндекс GPT...');
        
        const response = await axios.post(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
            {
                modelUri: `gpt://${YANDEX_FOLDER_ID || 'not-specified'}/yandexgpt-lite/latest`,
                completionOptions: {
                    stream: false,
                    temperature: 0.7,
                    maxTokens: 1000
                },
                messages: [
                    {
                        role: "system",
                        text: systemPrompt
                    },
                    {
                        role: "user",
                        text: question
                    }
                ]
            },
            {
                headers: {
                    'Authorization': `Api-Key ${YANDEX_API_KEY}`,
                    'Content-Type': 'application/json',
                    'x-folder-id': YANDEX_FOLDER_ID || ''
                },
                timeout: 30000 // 30 секунд таймаут
            }
        );
        
        console.log('✅ Получен ответ от Яндекс GPT');
        
        // Извлекаем ответ из структуры Яндекс GPT
        let answer;
        try {
            const result = response.data?.result;
            
            if (result && result.alternatives && result.alternatives.length > 0) {
                answer = result.alternatives[0].message.text;
            } else if (response.data?.alternatives?.[0]?.text) {
                // Альтернативная структура ответа
                answer = response.data.alternatives[0].text;
            } else {
                console.warn('Нестандартная структура ответа:', JSON.stringify(response.data).substring(0, 500));
                answer = JSON.stringify(response.data, null, 2);
            }
        } catch (parseError) {
            console.error('Ошибка парсинга ответа:', parseError);
            answer = 'Я, ' + rulerName.split(',')[0] + ', обдумываю твой вопрос. Вернись позже за ответом.';
        }
        
        // Убедимся, что ответ есть
        if (!answer || answer.trim() === '') {
            answer = `Я, ${rulerName.split(',')[0]}, выслушал твой вопрос. Это требует размышлений. Задай другой вопрос о моем правлении или реформах.`;
        }
        
        console.log('📤 Отправка ответа клиенту');
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true,
                answer: answer,
                ruler: rulerName.split(',')[0],
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('❌ Ошибка в функции yandex-gpt:', error);
        
        // Детали ошибки для отладки
        let errorMessage = 'Произошла ошибка при обработке запроса';
        let errorDetails = {};
        
        if (error.response) {
            // Ошибка от API Яндекс
            console.error('Статус:', error.response.status);
            console.error('Данные:', error.response.data);
            
            errorMessage = `Ошибка API Яндекс (${error.response.status})`;
            errorDetails = {
                status: error.response.status,
                data: error.response.data
            };
        } else if (error.request) {
            // Запрос был сделан, но ответа не было
            errorMessage = 'Нет ответа от сервера Яндекс';
            errorDetails = { request: 'Timeout or network error' };
        } else {
            // Что-то пошло не так при настройке запроса
            errorMessage = error.message || 'Неизвестная ошибка';
        }
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false,
                error: errorMessage,
                details: errorDetails,
                fallbackAnswer: `К сожалению, я, исторический правитель, временно не могу ответить на твой вопрос. Пожалуйста, попробуй позже.`
            })
        };
    }
};