# Dungeon.Py — devlog #2

## Заголовок

**Devlog #2: What the dungeon keeps behind locked chests**

Короткий вариант: **Devlog #2: Chests, keys and chance encounters**

## Текст для itch.io

Hello! **Dungeon.Py** is a browser roguelike where every fight is a Python
question. The **1.56.0** update is live, and this devlog is about the part of
the game that happens between fights.

The dungeon used to be simple: walk, open a chest, answer a question, go
deeper. Now some chests are **locked**. The key lies on the floor, sometimes in
another room, and you have to decide whether the detour is worth it. Other
chests offer **three items at once**, but you can take only one; the window
shows stats and the set bonus, so the choice is informed, not blind. A **trap**
can hit when you open a chest, but it never kills: a chest should be a find,
not a punishment.

Floors also have **encounters**. A wanderer can bandage your wounds or sell you
something he found. Ancient dice take 20 HP and give a chance at an item, gold
or nothing. You can always walk away. These are small decisions, but they
change the rhythm of a run: not every room is a question, and not every risk is
a battle.

The interface changed too. The inventory became a **Chest**: on desktop it is
gear, a bag grid, item details and set progress. On a phone, tapping an item
opens a bottom sheet with the same actions, while the map stays visible. The
codex has a new **Mechanics** tab, and the first key or locked chest explains
itself once.

The update also adds **five items** and **two sets**: Winter's Vow (defence and
health) and Dawn (damage and crit). The early floors were tuned: Crypts are one
monster lighter, and the storm hazard is gone from floor 5.

Dungeon.Py is still free, browser-only, with no account and no server. Saves
stay in your browser; Python runs locally with Pyodide.

I would love to hear how the new chests feel:

— Is the key detour worth it?
— Is the choice chest clear, or does it need more comparison?
— Do encounters add texture or just interrupt the run?

Comment here, open an issue on GitHub, or support the project on Boosty.
Thank you for playing.

## Изображения

1. После первого абзаца — `assets/itch/screenshots/chest-en.png`.
2. После абзаца про встречи — `assets/itch/screenshots/event-en.png`.
3. После абзаца про инвентарь — `assets/itch/screenshots/inventory-en.png`.

Подписи:

- “Three rewards, one choice.”
- “A wanderer at the entrance.”
- “The Chest inventory: gear, bag and sets in one window.”

## Ссылки в конце

```text
Play: https://jellyfish2077.github.io/dungeon-py/
GitHub: https://github.com/JellyFish2077/dungeon-py
Boosty: https://boosty.to/YOUR_PAGE
```

## Русская версия

**Devlog #2: Что подземелье прячет за запертыми сундуками**

Привет! **Dungeon.Py** — браузерный рогалик, где каждый бой — вопрос по
Python. Обновление **1.56.0** уже вышло, и этот devlog — о том, что
происходит между боями.

Раньше подземелье было простым: идёшь, открываешь сундук, отвечаешь на
вопрос, спускаешься глубже. Теперь часть сундуков **заперта**. Ключ лежит на
полу, иногда в другой комнате, и нужно решить, стоит ли обход. Другие сундуки
предлагают **три вещи сразу**, но взять можно только одну; в окне видны статы
и бонус набора, чтобы выбор был осознанным. **Ловушка** может ударить при
открытии, но никогда не убивает: сундук должен быть находкой, а не
наказанием.

На этажах появились **встречи**. Странник перевяжет раны или продаст
найденную вещь. Древний жребий берёт 20 HP и даёт шанс на предмет, золото или
ничего. Уйти можно всегда. Это небольшие решения, но они меняют ритм похода:
не каждая комната — вопрос, и не каждый риск — бой.

Интерфейс тоже изменился. Инвентарь стал **«Сундуком»**: на компьютере это
снаряжение, сетка сумки, карточка предмета и прогресс комплектов. На телефоне
карточка выезжает снизу, а карта остаётся видимой. В справочнике появилась
вкладка **«Механики»**, а первый ключ и первый запертый сундук объясняют
правило один раз.

В обновлении **пять новых предметов** и **два комплекта**: «Обет зимы»
(защита и здоровье) и «Рассвет» (урон и крит). Ранние этажи подкручены:
«Склепы» стали на одного врага легче, а гроза убрана с 5-го этажа.

Dungeon.Py по-прежнему бесплатна, работает в браузере, без аккаунта и
сервера. Сохранения лежат в браузере, Python проверяется локально через
Pyodide.

Хочу узнать, как ощущаются новые сундуки:

— Стоит ли обход за ключом?
— Понятен ли выбор из трёх вещей?
— Встречи добавляют атмосферу или просто прерывают поход?

Пишите здесь, открывайте issue на GitHub или поддерживайте проект на Boosty.
Спасибо, что играете.

---

# Dungeon.Py — devlog #1

## Заголовок

**Devlog #1: Why every fight in Dungeon.Py is a Python question**

Короткий вариант: **Devlog #1: Python as a weapon**

## Текст для itch.io

Hello! I'm the developer of **Dungeon.Py**, a small browser roguelike where you
fight with Python knowledge.

**Play in your browser:** https://jellyfish2077.github.io/dungeon-py/

The idea came from teaching. I kept seeing students who could recognise syntax
in a test but froze when they had to use it. I wanted a place where a Python
question has immediate consequences: answer correctly and your attack lands;
make a mistake and the monster hits back.

Dungeon.Py is that place. You descend 15 floors, cross five biomes and meet five
bosses. Questions come in five forms: choose an answer, fill in the blank, find
the error, copy code, or write a function. Between runs you return to the
village and restore the barn, the well, the forge and the master's house. The
village keeps your progress even when a run ends badly.

The game is free, runs in the browser and needs no account or server. Saves stay
in your browser; Python code is checked locally with Pyodide. English and
Russian are both available.

This is still an early version. I use AI tools for code, text and ideas, but the
goal is educational: to give students and self-learners a more engaging way to
practise Python. Direction, editing and final decisions are mine.

Right now I need feedback:

— Is the difficulty curve fair?
— Are the questions clear?
— Does the village give you a reason to keep playing?
— Where did you get stuck or bored?

You can leave a comment here, open an issue on GitHub, or support the project on
Boosty. Thank you for playing.

## Изображения

1. После первого абзаца — `assets/itch/screenshots/menu-en.png`.
2. После абзаца про 15 этажей — `assets/itch/screenshots/battle-en.png`.
3. После абзаца про деревню — `assets/itch/screenshots/journal-en.png`.

Подписи:

- “Dungeon.Py — a dungeon where code is the weapon.”
- “Every battle is a Python question.”
- “The journal: the current chapter, objectives and the path ahead.”

## Ссылки в конце

```text
Play: https://jellyfish2077.github.io/dungeon-py/
GitHub: https://github.com/JellyFish2077/dungeon-py
Boosty: https://boosty.to/YOUR_PAGE
```

## Русская версия

**Devlog #1: Почему каждый бой в Dungeon.Py — это вопрос по Python**

Привет! Я делаю **Dungeon.Py** — небольшую браузерную рогалик-игру, где
сражаешься знаниями Python.

**Играть в браузере:** https://jellyfish2077.github.io/dungeon-py/

Идея выросла из преподавания. Я видел студентов, которые узнают синтаксис в
тесте, но теряются, когда нужно применить его в деле. Мне хотелось место, где
вопрос по Python сразу имеет последствия: ответил верно — удар прошёл, ошибся —
монстр бьёт в ответ.

Dungeon.Py — это оно. Пятнадцать этажей, пять биомов и пять боссов. Вопросы
бывают пяти видов: выбрать ответ, заполнить пропуск, найти ошибку,
скопировать код или написать функцию. Между забегами ты возвращаешься в
деревню и восстанавливаешь амбар, колодец, кузницу и дом мастера. Деревня
сохраняет прогресс, даже если поход закончился плохо.

Игра бесплатная, работает в браузере и не требует аккаунта или сервера.
Сохранения лежат в браузере, Python-код проверяется локально через Pyodide.
Есть русский и английский.

Это ранняя версия. Я использую ИИ для кода, текстов и идей, но цель —
образовательная: дать студентам и тем, кто учится сам, более живой способ
практиковать Python. Направление, редактура и финальные решения — мои.

Сейчас мне нужна обратная связь:

— Насколько честная кривая сложности?
— Понятны ли вопросы?
— Даёт ли деревня причину продолжать?
— Где вы застряли или заскучали?

Можно оставить комментарий здесь, открыть issue на GitHub или поддержать
проект на Boosty. Спасибо, что играете.

## Что проверить перед публикацией

- [ ] Заменить `YOUR_PAGE` на ссылку Boosty.
- [ ] Проверить ссылку на itch.io в конце.
- [ ] Загрузить три изображения и подписи.
- [ ] Убедиться, что заголовок и первый абзац видны без раскрытия.
- [ ] Опубликовать как обычный пост, не как обновление файла.
