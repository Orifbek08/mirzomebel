# МИРЗО МЕБЕЛ · Бошқарув панели

Google Sheets'dagi **Производство**, **Финанс** va **Склад** jadvallaridan bitta `index.html` panel. Login yo'q, framework yo'q.

```
Google Sheets (3 ta jadval, faqat o'qiladi) ──► gs/Panel.gs (bitta Apps Script, bitta /exec) ──► index.html ──► GitHub ──► Vercel
```

Chap menyu tartibi: **Бошқарув панели** → **1 · Производство** → **2 · Финанс** → **3 · Склад**.

## Fayllar
| Fayl | Nima |
|---|---|
| `index.html` | Panel — `namuna.html` nusxasi (dizayn 1:1) + LOYIHA BLOKI + Мирзо bloki (Производство / Склад sahifalari, bosh sahifa) |
| `gs/Panel.gs` | Bitta Apps Script: `?amal=ishlab` (Производство) · `moliya` (Финанс) · `sklad` (Склад, «База Склад» varag'i) · `baza` (bo'sh — Сотув yo'q) |

## Jadvallar
| Bo'lim | Jadval | Varaq | Ustunlar |
|---|---|---|---|
| Производство | «Мирзо Мебел Производство» | Производство | Дата Монтаж · Тип Заказ · Монтажник · Имя Заказ · Тип товар · шт/кв ? · из? · Тип Склад · Коментарие |
| Финанс | «Мирзо мебел финансе» | Финансе | Дата · Касса · ТиП · Стадия · Сумма · Коментария |
| Склад | «Мирзо мебел Склад» | База Склад | Дата · Тип Заказ · Приход Или Расход · Имя Заказ · Тип товар · Тип Число · шт/кв · из? · Тип Склад · Коментарие · ID · Статус |

Skript jadvallarga **hech narsa yozmaydi**. Ustunlar sarlavha nomi bo'yicha topiladi.
Склад qoldig'i «Склад Состояния» bilan bir xil hisoblanadi: Тип Заказ + Имя Заказ + Тип товар + Тип Число + Склад → Приход − Расход.

## 1. Apps Script'ni ulash (bir marta)
1. https://script.google.com → **Новый проект**.
2. `Code.gs` ichini o'chirib, `gs/Panel.gs` matnini to'liq qo'ying.
3. Uchta `JADVAL_ID` (`SOZ_ISHLAB`, `SOZ_MOLIYA`, `SOZ_SKLAD`) ga jadval havolasini brauzerdan **to'liq** nusxalab qo'ying. 💾 Saqlang.
4. Funksiyalar ro'yxatidan **`sinov`** ni tanlab ▶ **Run** → ruxsat bering. Log'da har bo'lim bo'yicha topilgan ustunlar chiqadi.
5. **Развернуть → Новое развертывание → ⚙ Веб-приложение** · Выполнять от имени: **Я** · Доступ: **Все** → Развернуть.
6. Chiqqan `…/exec` havolasini `index.html` boshidagi `API`, `API_MOLIYA`, `API_MARKETING` ga qo'ying (uchalasi bir xil).

Kod o'zgarsa: **Управление развертываниями → ✏ → Версия: Новая версия** (havola o'zgarmaydi).
Tekshirish: `…/exec?amal=tekshir`, `…/exec?amal=ustunlar`. Keshsiz: `&yangi=1`.

## 2. Vercel (bir marta)
vercel.com → **Add New → Project** → `Orifbek08/mirzomebel` ni import → Framework: **Other**, Build yo'q → Deploy.
Keyin har `git push` avtomatik chiqadi.
