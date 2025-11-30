# -*- coding: utf-8 -*-
import streamlit as st
import requests
import json
import os
from dotenv import load_dotenv

# 🔐 Загружаем переменные окружения
load_dotenv()

# 🗝️ Безопасное получение ключей
API_KEY = os.getenv("YANDEX_API_KEY")
folder_id = os.getenv("YANDEX_FOLDER_ID")

# 🚨 Проверка наличия ключей
if not API_KEY or not folder_id:
    st.error("❌ Ключи API не настроены. Пожалуйста, проверьте переменные окружения.")
    st.stop()

st.set_page_config(
    page_title="Машина времени",
    page_icon="👑",
    layout="wide"
)

PERSONAZHI = {
    "petr": {
        "name": "Петр I Великий",
        "opisanie": "Царь-реформатор, любит корабли и науки, говорит грубовато",
        "avatar": "🧔"
    },
    "ekaterina": {
        "name": "Екатерина II Великая", 
        "opisanie": "Умная императрица, любит искусство, говорит изящно",
        "avatar": "👸"
    }
}

def poluchit_otvet_yandex(personazh, vopros):
    if personazh == "petr":
        system_text = "Ты - царь Петр I Великий (годы жизни: 1672-1725). Говоришь грубовато и прямо, используй старинные слова: чаю, надобно, негоже. Обожаешь корабли и науки. Ненавидишь старые порядки. Никогда не выходи из образа! Отвечай как человек из 18 века."
    else:
        system_text = "Ты - императрица Екатерина II Великая (годы жизни: 1729-1796). Говоришь умно и изящно, цитируй философов: Вольтера, Дидро. Любишь искусство и науки. Мудрая и ироничная. Никогда не выходи из образа! Отвечай как человек из 18 века."
    
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
        response.raise_for_status()  # Проверка HTTP ошибок
        result = response.json()
        otvet_text = result['result']['alternatives'][0]['message']['text']
        return otvet_text
    except Exception as e:
        return f"❌ Ой, Яндекс GPT не отвечает... Ошибка: {str(e)}"

# ==================== ОСНОВНАЯ ЧАСТЬ ПРИЛОЖЕНИЯ ====================

# Инициализация session_state
if 'vybranniy_personazh' not in st.session_state:
    st.session_state.vybranniy_personazh = None
if 'istorija_chata' not in st.session_state:
    st.session_state.istorija_chata = []

st.title("👑 Машина Времени")
st.markdown("### ✨ Выбери царя и задай ему вопрос из 21 века!")

with st.sidebar:
    st.header("🎭 Выбери собеседника")
    st.markdown("---")
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🧔 Петр I", key="petr_btn", use_container_width=True):
            st.session_state.vybranniy_personazh = "petr"
            st.session_state.istorija_chata = ["🧔 **Петр I:** Здравствуй! Я Петр Великий. О чем хочешь спросить?"]
            st.rerun()
    with col2:
        if st.button("👸 Екатерина II", key="ekat_btn", use_container_width=True):
            st.session_state.vybranniy_personazh = "ekaterina"
            st.session_state.istorija_chata = ["👸 **Екатерина II:** Здравствуй, мой друг! Я Екатерина Великая. Что тебя интересует?"]
            st.rerun()
    
    st.markdown("---")
    st.info("💡 **Совет:** Спроси о реформах, войнах, науках или жизни того времени!")

if st.session_state.vybranniy_personazh:
    personazh = st.session_state.vybranniy_personazh
    imya = PERSONAZHI[personazh]["name"]
    avatar = PERSONAZHI[personazh]["avatar"]
    
    st.header(f"{avatar} Беседа с {imya}")
    st.success(f"**О персонаже:** {PERSONAZHI[personazh]['opisanie']}")
    
    with st.container():
        st.subheader("📜 История вашей беседы:")
        st.markdown("---")
        
        for soobshenie in st.session_state.istorija_chata:
            if "Ты:" in soobshenie:
                st.markdown(f"🎯 **{soobshenie}**")
            else:
                st.markdown(f"👑 **{soobshenie}**")
            st.markdown("---")
    
    with st.form(key='chat_form'):
        vopros = st.text_area(
            "💭 Твой вопрос царю:",
            placeholder="Например: Зачем Вы рубили бороды? Или: Почему построили Петербург на болотах?",
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
    
    if st.button("🗑️ Начать беседу заново", type="secondary"):
        st.session_state.istorija_chata = [f"{avatar} **{imya}:** Здравствуй! О чем хочешь поговорить?"]
        st.rerun()

else:
    st.markdown("""
    ## 🕰️ Добро пожаловать в Машину Времени!
    
    ### 🎯 Что это такое?
    Это интерактивный чат где ты можешь **лично пообщаться** с великими русскими царями!
    
    ### 🎮 Как играть?
    1. **Выбери царя** слева в меню 👈
    2. **Задай вопрос** о его жизни, реформах, эпохе  
    3. **Получи ответ** в уникальном стиле персонажа!
    4. **Узнавай историю** через живой диалог!
    """)

# 🔧 Техническая информация
with st.expander("🔧 Техническая информация"):
    st.write(f"**Статус API:** {'✅ Настроено' if API_KEY and folder_id else '❌ Не настроено'}")
    st.write(f"**Folder ID:** {'***' + folder_id[-4:] if folder_id else 'Не установлен'}")