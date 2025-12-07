# -*- coding: utf-8 -*-
import streamlit as st
import requests
import json
import os

# 🔐 Получаем ключи из secrets.toml (Streamlit Cloud)
API_KEY = st.secrets["YANDEX_API_KEY"]
folder_id = st.secrets["YANDEX_FOLDER_ID"]

# 🎨 Настраиваем страницу
st.set_page_config(
    page_title="Машина времени",
    page_icon="👑",
    layout="wide"
)

# 👥 Наши персонажи
PERSONAZHI = {
    "ivan": {
        "name": "Иван IV Грозный",
        "opisanie": "Первый царь всея Руси, суровый и противоречивый правитель",
        "avatar": "👑"
    },
    "petr": {
        "name": "Петр I Великий",
        "opisanie": "Царь-реформатор, любит корабли и науки",
        "avatar": "🧔"
    },
    "ekaterina": {
        "name": "Екатерина II Великая",
        "opisanie": "Умная императрица, любит искусство",
        "avatar": "👸"
    }
}

# 🧠 Функция для получения ответа от Яндекс GPT
def poluchit_otvet_yandex(personazh, vopros):
    if personazh == "ivan":
        system_text = "Ты - царь Иван IV Грозный. Говоришь грозно, властно, с религиозными оборотами."
    elif personazh == "petr":
        system_text = "Ты - царь Петр I Великий. Говоришь грубовато и прямо."
    else:
        system_text = "Ты - императрица Екатерина II Великая. Говоришь умно и изящно."
    
    try:
        url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Api-Key {API_KEY}"
        }
        
        data = {
            "modelUri": f"gpt://{folder_id}/yandexgpt-lite",
            "completionOptions": {
                "stream": False,
                "temperature": 0.7,
                "maxTokens": 1000
            },
            "messages": [
                {
                    "role": "user",
                    "text": f"{system_text}\n\nВопрос от ученика: {vopros}"
                }
            ]
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        otvet_text = result['result']['alternatives'][0]['message']['text']
        return otvet_text
        
    except Exception as e:
        return f"❌ Ошибка: {str(e)}"

# ==================== ОСНОВНОЙ КОД ====================

st.title("👑 Машина Времени")
st.markdown("### ✨ Выбери правителя и задай ему вопрос!")

# Боковая панель
with st.sidebar:
    st.header("🎭 Выбери собеседника")
    st.markdown("---")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("👑 Иван IV")
        if st.button("Вперед →", key="ivan_btn", use_container_width=True):
            st.session_state.vybranniy_personazh = "ivan"
            st.session_state.istorija_chata = ["👑 **Иван IV:** Здравствуй, чадо! О чем желаешь ведать?"]
            st.rerun()
    
    with col2:
        st.subheader("🧔 Петр I")
        if st.button("Вперед →", key="petr_btn", use_container_width=True):
            st.session_state.vybranniy_personazh = "petr"
            st.session_state.istorija_chata = ["🧔 **Петр I:** Здравствуй! О чем хочешь спросить?"]
            st.rerun()
    
    col3, col4 = st.columns(2)
    
    with col3:
        st.subheader("👸 Екатерина II")  
        if st.button("Вперед →", key="ekat_btn", use_container_width=True):
            st.session_state.vybranniy_personazh = "ekaterina"
            st.session_state.istorija_chata = ["👸 **Екатерина II:** Здравствуй! Что тебя интересует?"]
            st.rerun()
    
    with col4:
        st.write("")
    
    st.markdown("---")
    
    # Статус ключей
    with st.expander("🔐 Статус ключей"):
        if API_KEY and folder_id:
            st.success("✅ Ключи загружены")
            st.write(f"**Folder ID:** `{folder_id[:10]}...`")
        else:
            st.error("❌ Ключи не найдены")

# Основной чат
if 'vybranniy_personazh' in st.session_state:
    personazh = st.session_state.vybranniy_personazh
    imya = PERSONAZHI[personazh]["name"]
    avatar = PERSONAZHI[personazh]["avatar"]
    
    st.header(f"{avatar} Беседа с {imya}")
    st.success(f"**О персонаже:** {PERSONAZHI[personazh]['opisanie']}")
    
    # История чата
    with st.container():
        st.subheader("📜 История беседы:")
        st.markdown("---")
        
        for soobshenie in st.session_state.istorija_chata:
            if "Ты:" in soobshenie:
                st.markdown(f"🎯 **{soobshenie}**")
            else:
                st.markdown(f"{avatar} **{soobshenie.split(' ', 1)[1]}**")
            st.markdown("---")
    
    # Форма для вопроса
    with st.form(key='chat_form'):
        vopros = st.text_area(
            "💭 Твой вопрос правителю:",
            placeholder="Например: Зачем Вы ввели опричнину?",
            height=100
        )
        
        otpravit_btn = st.form_submit_button(
            label="📨 Отправить вопрос",
            type="primary"
        )
    
    if otpravit_btn and vopros.strip():
        st.session_state.istorija_chata.append(f"Ты: {vopros}")
        
        with st.spinner(f"🔄 {avatar} {imya} обдумывает ответ..."):
            otvet = poluchit_otvet_yandex(personazh, vopros)
        
        st.session_state.istorija_chata.append(f"{avatar} **{imya}:** {otvet}")
        st.rerun()
    
    if st.button("🗑️ Начать заново", type="secondary"):
        st.session_state.istorija_chata = [f"{avatar} **{imya}:** Здравствуй! О чем хочешь поговорить?"]
        st.rerun()

else:
    st.markdown("""
    ## 🕰️ Добро пожаловать в Машину Времени!
    
    ### 🎯 Что это?
    Интерактивный чат с великими русскими правителями!
    
    ### 🎮 Как играть?
    1. **Выбери правителя** слева 👈
    2. **Задай вопрос** о его жизни
    3. **Получи ответ** в стиле персонажа!
    """)

# Инициализация session_state
if 'vybranniy_personazh' not in st.session_state:
    st.session_state.vybranniy_personazh = None
if 'istorija_chata' not in st.session_state:
    st.session_state.istorija_chata = []