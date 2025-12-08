// config.js - НАСТРОЙКИ ЯНДЕКС GPT
// ВСТАВЬТЕ СВОИ КЛЮЧИ ЗДЕСЬ:

window.CONFIG = {
    // Режим работы: 'api' для Яндекс GPT, 'demo' для демо-режима
    MODE: 'api',
    
    // ВАШИ КЛЮЧИ ОТ ЯНДЕКС ОБЛАКА:
    YANDEX_API_KEY: 'AQVN1mVjk3ChoQnm0sIMQyyx94534m9IsSYcWDnf',
    YANDEX_FOLDER_ID: 'b1gof6m2ru5t8pqmchi9',
    
    // Использовать прокси для обхода CORS
    USE_PROXY: true,
    
    // Использовать демо-ответы если API не работает
    USE_DEMO_IF_API_FAILS: true
};

console.log('⚙️ Конфигурация загружена из config.js');