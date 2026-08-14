# Magic Progress — техническое задание для Codex

## 1. Задача

Создай веб-приложение **Magic Progress** для репетитора английского языка.

В одном репозитории должны находиться две части:

1. **Student Tracker** — публичная страница ученика с красивой волшебной картой прогресса.
2. **Admin Panel** — закрытая админка преподавателя для управления учениками, домашними заданиями, баллами и наградами.

Обе части используют:

- один Firebase project;
- одну Cloud Firestore database;
- Firebase Authentication для администратора;
- один GitHub repository;
- один GitHub Pages deployment.

Не создавать два отдельных проекта.

---

# 2. Основной принцип системы

Ученик выполняет домашние задания вне этого сайта, например в Wordwall.

Одно домашнее задание может содержать любое количество заданий.

Пример:

- преподаватель дал 5 заданий;
- ученик выполнил 3;
- получает 3 балла;
- позже доделал ещё 2;
- итог становится 5/5;
- система должна начислить только ещё 2 балла.

Главное правило:

> **1 выполненное задание = 1 кристалл.**

Не делить задания на Vocabulary / Reading / Listening / Writing / Speaking.

Система не должна требовать от преподавателя классифицировать задания.

Домашка отображается просто:

`3 / 5`

или:

`5 / 5`

Количество заданий может быть разным.

---

# 3. Игровая концепция

Баллы называются **кристаллами**.

Использовать символ:

`💎`

У ученика есть два разных числовых показателя.

## balance

Текущий баланс кристаллов.

Их можно потратить на награды.

Пример:

`12 💎`

## totalEarned

Общее количество кристаллов, заработанное за всё время.

Это число определяет продвижение по волшебной карте.

При покупке награды `balance` уменьшается, но `totalEarned` не уменьшается.

Пример:

Ученик заработал 40 кристаллов и потратил 20.

```text
balance = 20
totalEarned = 40
```

Его персонаж НЕ двигается назад по карте.

---

# 4. Что НЕ нужно делать

Не добавлять:

- питомцев;
- RPG-характеристики;
- несколько игровых валют;
- XP как отдельную видимую валюту;
- рейтинг учеников;
- соревнования между учениками;
- категории домашних заданий;
- сложные квестовые механики;
- чат;
- отправку домашних заданий;
- загрузку скриншотов;
- LMS;
- регистрацию учеников;
- аккаунты учеников.

Интерфейс ученика должен быть максимально простым.

---

# 5. Технологии

Использовать:

- Vite;
- vanilla JavaScript ES Modules;
- HTML;
- CSS;
- Firebase Web SDK через npm package `firebase`;
- Cloud Firestore;
- Firebase Authentication;
- GitHub Pages.

Не использовать React, Vue или другой frontend framework без необходимости.

Не использовать backend-сервер.

Вся безопасность должна обеспечиваться Firebase Authentication + Firestore Security Rules.

---

# 6. Структура проекта

Создать примерно такую структуру:

```text
magic-progress/
│
├── index.html
├── admin/
│   └── index.html
│
├── src/
│   ├── tracker/
│   │   ├── tracker.js
│   │   ├── tracker.css
│   │   └── map.js
│   │
│   ├── admin/
│   │   ├── admin.js
│   │   ├── admin.css
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── homework.js
│   │   ├── rewards.js
│   │   └── transactions.js
│   │
│   ├── firebase/
│   │   ├── studentFirebase.js
│   │   └── adminFirebase.js
│   │
│   ├── shared/
│   │   ├── calculations.js
│   │   ├── formatters.js
│   │   └── constants.js
│   │
│   └── data/
│       └── mapStops.js
│
├── public/
│   └── assets/
│       └── map/
│
├── firestore.rules
├── AGENTS.md
├── README.md
├── vite.config.js
└── package.json
```

Допускается немного изменить структуру, если есть техническая причина, но сохранить разделение tracker/admin/shared.

---

# 7. Два сайта внутри одного проекта

## Student Tracker

Главная страница:

```text
/
```

Пример персональной ссылки:

```text
/?s=PUBLIC_TOKEN
```

## Admin Panel

Адрес:

```text
/admin/
```

Не использовать SPA routing.

Это должны быть две отдельные HTML entry points.

Настроить Vite как multi-page application.

---

# 8. Firebase

Firebase project уже создан:

```text
magic-progress
```

В нём зарегистрированы два Web App:

```text
Magic Map Student
Magic Map Editor
```

Firebase config НЕ считать секретом.

Но:

- никогда не хранить пароль администратора в коде;
- никогда не хранить Firebase Admin SDK private key;
- никогда не хранить service account JSON.

Создать отдельные модули конфигурации для Student и Admin Web App.

Если реальный Student Firebase config пока отсутствует, оставить понятный placeholder и описать в README, куда его вставить.

---

# 9. Авторизация администратора

Использовать:

```text
Firebase Authentication
Email/Password
```

На экране пользователь должен видеть:

```text
Логин
Пароль

[ Войти ]
```

Не обязательно показывать слово `email`.

Поддержать два варианта.

Если пользователь вводит:

```text
example@email.com
```

использовать значение как email.

Если вводит простой логин:

```text
julia
```

преобразовать внутри приложения в:

```text
julia@magic-progress.local
```

Пример функции:

```js
function loginToEmail(login) {
  const value = login.trim().toLowerCase();

  if (value.includes('@')) {
    return value;
  }

  return `${value}@magic-progress.local`;
}
```

Пароль никогда не сохранять в LocalStorage.

Firebase Authentication самостоятельно поддерживает авторизованную сессию.

---

# 10. Администраторы

В Firestore уже существует коллекция:

```text
admins
```

Document ID администратора равен Firebase Auth UID.

Пример:

```text
admins
└── AUTH_UID
    ├── role: "admin"
    └── active: true
```

После Firebase Authentication пользователь получает доступ к админке только если существует:

```text
admins/{request.auth.uid}
```

и:

```text
active == true
```

Если пользователь авторизован, но не является администратором:

- не показывать данные;
- показать сообщение `Нет доступа`;
- выполнить signOut.

---

# 11. Важное изменение структуры публичных данных

Не давать публичному Student Tracker прямой доступ к документам:

```text
students
```

Коллекция `students` должна стать приватной.

Создать отдельную коллекцию:

```text
publicProfiles
```

Это нужно для того, чтобы в будущем в `students` можно было безопасно добавлять внутренние поля преподавателя.

Student Tracker читает только:

```text
publicProfiles/{publicToken}
```

---

# 12. Коллекция students

Структура:

```text
students/{studentId}
```

Поля:

```text
displayName: string
balance: number
totalEarned: number
active: boolean
publicToken: string
createdAt: timestamp
updatedAt: timestamp
```

Пример:

```text
displayName: "Маша"
balance: 14
totalEarned: 29
active: true
publicToken: "random-long-token"
```

`studentId` создавать через Firestore Auto ID.

Не использовать имя или фамилию ребёнка как Document ID.

---

# 13. publicProfiles

Создавать:

```text
publicProfiles/{publicToken}
```

`publicToken` должен быть случайным и труднопредсказуемым.

Можно использовать:

```js
crypto.randomUUID().replaceAll('-', '')
```

Публичный документ содержит только:

```text
displayName
balance
totalEarned
active
latestHomeworkId
latestHomeworkCompleted
latestHomeworkTotal
latestHomeworkDate
```

Не хранить здесь:

- фамилию;
- телефон;
- email;
- заметки преподавателя;
- UID;
- внутренние комментарии.

---

# 14. Персональная ссылка ученика

После создания ученика Admin Panel должна автоматически создавать персональную ссылку:

```text
TRACKER_URL/?s=PUBLIC_TOKEN
```

В карточке ученика должна быть кнопка:

```text
Скопировать ссылку
```

Не хардкодить абсолютный домен.

Сформировать адрес относительно текущего GitHub Pages deployment.

Если админка открыта по:

```text
.../magic-progress/admin/
```

трекер должен автоматически определяться как:

```text
.../magic-progress/
```

---

# 15. Подколлекция homeworks

Для каждого ученика:

```text
students/{studentId}/homeworks/{homeworkId}
```

Поля:

```text
title: string
totalTasks: number
completedTasks: number
pointsAwarded: number
createdAt: timestamp
updatedAt: timestamp
```

Пример:

```text
title: "Homework 13 Aug"
totalTasks: 5
completedTasks: 3
pointsAwarded: 3
```

Название домашки может быть необязательным.

Если название не введено, автоматически использовать дату:

```text
Домашнее задание — 13.08.2026
```

---

# 16. Логика изменения домашки

Это критически важная часть.

Никогда не начислять повторно все баллы при редактировании.

Использовать:

```text
delta = newCompletedTasks - oldPointsAwarded
```

Пример.

Было:

```text
completedTasks = 3
pointsAwarded = 3
```

Стало:

```text
completedTasks = 5
```

Тогда:

```text
delta = 5 - 3 = +2
```

Начислить только:

```text
+2
```

После этого:

```text
pointsAwarded = 5
```

Если преподаватель исправил ошибку:

```text
4/5 → 3/5
```

тогда:

```text
delta = -1
```

Баланс и totalEarned должны быть скорректированы на `-1`.

---

# 17. Использовать Firestore transactions

Обновление домашки и баланса должно происходить атомарно через:

```js
runTransaction()
```

В одной transaction:

1. прочитать homework;
2. прочитать student;
3. вычислить delta;
4. обновить homework;
5. обновить student;
6. обновить publicProfile;
7. создать transaction history record.

Если один шаг не выполнен — ничего не должно измениться.

---

# 18. История операций

Для каждого ученика:

```text
students/{studentId}/transactions/{transactionId}
```

Поля:

```text
amount: number
type: string
description: string
relatedId: string | null
createdAt: timestamp
```

Типы:

```text
homework
reward
manual
correction
initial
```

Пример:

```text
amount: 3
type: "homework"
description: "Homework 13 Aug"
```

Позже:

```text
amount: 2
type: "homework"
description: "Homework 13 Aug"
```

Покупка:

```text
amount: -10
type: "reward"
description: "Mystery Gift"
```

Историю не удалять.

---

# 19. Добавление ученика

В Admin Panel должна быть кнопка:

```text
+ Добавить ученика
```

Форма:

```text
Имя
Стартовый баланс
Всего заработано
```

По умолчанию:

```text
Стартовый баланс = 0
Всего заработано = стартовый баланс
```

Это нужно для переноса существующих учеников из старых таблиц.

При создании ученика автоматически:

1. создать `students/{studentId}`;
2. сгенерировать `publicToken`;
3. создать `publicProfiles/{publicToken}`;
4. при ненулевом стартовом балансе создать transaction типа `initial`.

Использовать Firestore batch или transaction.

---

# 20. Старые тестовые записи

В Firestore уже может существовать `Test Student`, созданный вручную и не имеющий:

```text
publicToken
```

Admin Panel должна корректно это обрабатывать.

Если открывается такой ученик, показать:

```text
У ученика пока нет публичной ссылки.

[ Создать ссылку ]
```

После нажатия:

- сгенерировать publicToken;
- обновить student;
- создать publicProfile.

Не падать с ошибкой.

---

# 21. Архивирование

Не удалять ученика обычной кнопкой.

Использовать:

```text
Архивировать
```

При архивировании:

```text
students.active = false
publicProfiles.active = false
```

Архивный ученик исчезает из обычного списка администратора.

Добавить отдельный переключатель:

```text
Показать архивных
```

Предусмотреть восстановление ученика.

---

# 22. Награды

Коллекция:

```text
rewards/{rewardId}
```

Поля:

```text
title: string
cost: number
emoji: string
active: boolean
createdAt: timestamp
```

Пример:

```text
title: "Mystery Gift"
cost: 20
emoji: "🎁"
active: true
```

В Admin Panel создать раздел:

```text
Награды
```

Функции:

- добавить;
- изменить;
- архивировать;
- восстановить.

Не удалять награды без необходимости.

---

# 23. Покупка награды

На странице ученика в Admin Panel преподаватель может выбрать награду и нажать:

```text
Выдать награду
```

Перед операцией показать подтверждение:

```text
Списать 20 💎 у Маши за «Mystery Gift»?
```

Использовать Firestore transaction.

Проверить:

```text
student.balance >= reward.cost
```

При успешной покупке:

```text
balance -= reward.cost
```

`totalEarned` НЕ менять.

Обновить:

```text
students
publicProfiles
transactions
```

Transaction:

```text
amount = -reward.cost
type = "reward"
```

---

# 24. Admin Panel — экран входа

До авторизации показывать только:

```text
MAGIC PROGRESS

Логин
[_______________]

Пароль
[_______________]

[ Войти ]
```

Добавить:

- состояние загрузки;
- понятную ошибку неверного логина/пароля;
- кнопку показать/скрыть пароль.

Не показывать Firebase error codes пользователю напрямую.

---

# 25. Admin Panel — главный экран

После входа:

```text
Magic Progress
Ученики              Награды              Выйти

[ + Добавить ученика ]

Поиск: [____________]
```

Карточка ученика:

```text
Маша

💎 Баланс: 14
🗺 Пройдено: 29
Последнее ДЗ: 3 / 5

[ Открыть ]
[ Скопировать ссылку ]
```

Интерфейс преподавателя должен быть функциональным и быстрым.

Не делать fantasy-дизайн админки.

Админка должна выглядеть:

- чисто;
- современно;
- спокойно;
- удобно;
- хорошо работать на компьютере.

---

# 26. Страница конкретного ученика в админке

Показывать:

```text
← Все ученики

Маша

Баланс
14 💎

Всего заработано
29

Персональная ссылка
[ Скопировать ]

Домашние задания
[ + Добавить ДЗ ]

Награды
[ Выдать награду ]

История операций
```

---

# 27. Быстрое добавление домашки

Это одна из главных функций.

Форма должна быть максимально простой:

```text
Название: [ Homework 13 Aug ]

Выполнено:
[ 3 ] из [ 5 ]

[ Сохранить ]
```

Не добавлять никаких типов упражнений.

Не спрашивать:

- Vocabulary;
- Reading;
- Listening;
- Grammar;
- Writing.

Преподаватель вводит только:

```text
3 / 5
```

---

# 28. Редактирование домашки

В списке:

```text
13 Aug    3 / 5    +3 💎    [ Изменить ]
```

После редактирования:

```text
5 / 5
```

показать перед сохранением:

```text
Будет начислено ещё: +2 💎
```

Если изменение в меньшую сторону:

```text
4 / 5 → 3 / 5
```

показать:

```text
Корректировка: −1 💎
```

Это должно рассчитываться до сохранения.

---

# 29. Student Tracker — главное правило UX

Ребёнок должен понять страницу примерно за 3 секунды.

Не делать сложные панели.

Не использовать много текста.

Главные элементы:

```text
Привет, Маша!

💎 14

Волшебная карта

До следующей точки:
ещё 1 💎

Последнее ДЗ
💎 💎 💎 ◇ ◇
3 / 5

Награды
```

---

# 30. Student Tracker — визуальный стиль

Сделать красивый современный fantasy/adventure дизайн для детей примерно 7–13 лет.

Не делать дошкольный стиль.

Не использовать слишком мультяшный preschool UI.

Стиль:

- волшебное путешествие;
- fantasy;
- glowing crystals;
- лес;
- мост;
- замок;
- горы;
- магические огни;
- облака;
- звёзды;
- мягкие анимации;
- современная игровая эстетика.

Цветовая гамма:

- глубокий синий;
- фиолетовый;
- бирюзовый;
- золотистые акценты;
- светящиеся кристаллы.

Не использовать copyrighted Disney assets или персонажей.

Все визуальные элементы должны быть оригинальными.

---

# 31. Волшебная карта

Карта должна быть центральным элементом страницы.

Не делать просто progress bar.

Создать оригинальную карту как SVG/CSS композицию.

Архитектуру карты сделать data-driven.

Файл:

```text
src/data/mapStops.js
```

Пример:

```js
export const mapStops = [
  {
    id: 'village',
    required: 0,
    label: 'Little Village',
    x: 10,
    y: 82
  },
  {
    id: 'forest',
    required: 5,
    label: 'Enchanted Forest',
    x: 25,
    y: 70
  },
  {
    id: 'bridge',
    required: 10,
    label: 'Moonlight Bridge',
    x: 42,
    y: 61
  }
];
```

`x` и `y` — координаты в процентах поверх карты.

Это должно позволить позже полностью заменить картинку карты и координаты без переписывания логики Firebase.

---

# 32. Продвижение по карте

Использовать:

```text
totalEarned
```

а не:

```text
balance
```

Найти последнюю точку:

```text
mapStop.required <= totalEarned
```

Определить следующую.

Показать:

```text
До Crystal Castle осталось 3 💎
```

Если ученик потратил баллы, положение на карте не меняется.

---

# 33. Текущая позиция

Текущая точка должна визуально выделяться.

Использовать:

- мягкое свечение;
- лёгкую pulse-анимацию;
- marker;
- небольшой текст `YOU ARE HERE` или русскую версию.

Пройденные точки:

- яркие;
- открытые.

Будущие:

- слегка затемнённые;
- можно использовать лёгкий туман.

Не усложнять взаимодействие.

---

# 34. Последняя домашка

На Tracker показать:

```text
Последнее ДЗ
```

Например:

```text
💎 💎 💎 ◇ ◇

3 / 5
```

Не создавать больше 10 иконок подряд.

Если заданий много, использовать вместо отдельных кристаллов:

```text
7 / 12
```

---

# 35. Награды на Tracker

Показать активные награды из:

```text
rewards
```

Карточка:

```text
🎁
Mystery Gift
20 💎
```

Если баллов хватает:

```text
Можно получить
```

Если нет:

```text
Ещё 6 💎
```

На первой версии ребёнок НЕ должен самостоятельно покупать награду.

Списание делает преподаватель через Admin Panel.

---

# 36. Firestore Security Rules

Создать файл:

```text
firestore.rules
```

Использовать следующую модель:

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null
        && exists(
          /databases/$(database)/documents/admins/$(request.auth.uid)
        )
        && get(
          /databases/$(database)/documents/admins/$(request.auth.uid)
        ).data.active == true;
    }

    match /admins/{uid} {
      allow read, write: if false;
    }

    match /students/{studentId} {
      allow read, create, update, delete: if isAdmin();

      match /homeworks/{homeworkId} {
        allow read, write: if isAdmin();
      }

      match /transactions/{transactionId} {
        allow read, write: if isAdmin();
      }
    }

    match /publicProfiles/{publicToken} {
      allow get: if resource.data.active == true;
      allow list: if false;

      allow create, update, delete: if isAdmin();
    }

    match /rewards/{rewardId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
  }
}
```

Не ослаблять эти правила ради удобства разработки.

Не использовать:

```text
allow read, write: if true;
```

---

# 37. Обработка отсутствующего ученика

Если пользователь открывает:

```text
/?s=неправильный-token
```

показать красивую страницу:

```text
Эта волшебная карта не найдена ✨

Проверь ссылку или попроси преподавателя прислать новую.
```

Не показывать техническую Firebase ошибку.

---

# 38. Loading state

При загрузке Student Tracker сначала показывать красивое состояние:

```text
✨ Открываем волшебную карту...
```

Не показывать пустые блоки.

---

# 39. Ошибки

Создать общий error handler.

Пользователю показывать понятные сообщения на русском.

В console можно выводить технические ошибки для debugging.

Никогда не показывать ребёнку:

```text
FirebaseError
permission-denied
auth/...
```

---

# 40. Responsive design

Student Tracker должен хорошо работать:

- на телефоне;
- на планшете;
- на компьютере.

Главный приоритет:

```text
mobile-first
```

Карта должна оставаться читаемой на узком экране.

Admin Panel в первую очередь оптимизировать под desktop, но сделать usable на планшете.

---

# 41. Accessibility

Обеспечить:

- хороший контраст;
- keyboard navigation в админке;
- labels для форм;
- focus states;
- `prefers-reduced-motion`;
- текстовые значения прогресса, а не только визуальные.

---

# 42. Проверки данных

Не разрешать:

```text
completedTasks < 0
completedTasks > totalTasks
totalTasks <= 0
reward.cost <= 0
```

Все баллы должны быть целыми числами.

Перед записью валидировать данные.

---

# 43. Защита от двойного клика

При сохранении:

- блокировать кнопку;
- показывать `Сохраняем...`;
- не позволять отправить операцию дважды.

Особенно важно для:

- домашки;
- покупки награды;
- создания ученика.

---

# 44. Состояние после операции

После сохранения показать небольшой toast:

```text
✓ Сохранено
```

После начисления:

```text
✓ Начислено +2 💎
```

После награды:

```text
✓ Списано 20 💎
```

---

# 45. GitHub Pages

Настроить production build.

Создать GitHub Actions workflow для автоматического deployment на GitHub Pages после push в основную ветку.

После build должны корректно существовать:

```text
/
```

и:

```text
/admin/
```

Учесть base path GitHub Pages repository deployment.

Никакие пути к CSS, JS и изображениям не должны ломаться при размещении в subdirectory.

---

# 46. README

Создать понятный `README.md` для человека, который почти не умеет программировать.

Обязательно описать:

## Local run

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Firebase configuration

Пошагово показать:

- куда вставлять Student firebaseConfig;
- куда вставлять Admin firebaseConfig.

## Firebase Authentication

Объяснить, что для логина:

```text
julia
```

можно создать Firebase Auth пользователя:

```text
julia@magic-progress.local
```

После этого UID пользователя нужно добавить как Document ID в:

```text
admins
```

## Firestore Rules

Показать, где находится:

```text
firestore.rules
```

и предупредить, что правила должны быть опубликованы в Firebase.

## GitHub Pages

Объяснить, как включить deployment.

---

# 47. AGENTS.md

В корне проекта создать:

```text
AGENTS.md
```

Зафиксировать там главные правила проекта:

- одна выполненная задача = один кристалл;
- homework не делится на категории;
- balance уменьшается при покупке;
- totalEarned при покупке не уменьшается;
- продвижение карты основано только на totalEarned;
- дети не авторизуются;
- Student Tracker не может менять данные;
- students private;
- publicProfiles public get-only;
- все изменения баланса проходят через Firestore transaction;
- не добавлять питомцев;
- не добавлять leaderboard;
- интерфейс ребёнка должен оставаться простым;
- admin interface должен быть быстрым и практичным.

---

# 48. Чистота кода

Не писать всё приложение в одном JS-файле.

Вынести:

- Firebase;
- calculations;
- Firestore operations;
- UI rendering;
- authentication;
- map calculation;

в отдельные модули.

Использовать понятные имена.

Добавлять комментарии только там, где логика действительно неочевидна.

---

# 49. Pure functions

Создать и протестировать минимум такие функции:

```js
calculateHomeworkDelta(oldPoints, newCompleted)
```

```js
getCurrentMapStop(totalEarned, mapStops)
```

```js
getNextMapStop(totalEarned, mapStops)
```

```js
getCrystalsToNextStop(totalEarned, mapStops)
```

```js
loginToEmail(login)
```

---

# 50. Тестовые сценарии

Перед завершением проверить минимум эти сценарии.

## Homework

Новое ДЗ:

```text
0/5 → 3/5
```

Результат:

```text
balance +3
totalEarned +3
```

Дополнение:

```text
3/5 → 5/5
```

Результат:

```text
balance +2
totalEarned +2
```

Коррекция:

```text
5/5 → 4/5
```

Результат:

```text
balance -1
totalEarned -1
```

## Reward

До:

```text
balance = 25
totalEarned = 40
```

Награда:

```text
20
```

После:

```text
balance = 5
totalEarned = 40
```

Карта остаётся на позиции для 40.

## Security

Без Authentication нельзя:

- получить список students;
- читать student;
- менять student;
- добавлять homework;
- менять balance.

По publicToken можно:

- получить только конкретный publicProfile.

Нельзя:

- получить список publicProfiles.

---

# 51. Порядок разработки

Не пытайся сделать всё одним огромным изменением.

Работай этапами.

## Phase 1

Создать:

- Vite project;
- multi-page structure;
- Student page;
- Admin page;
- Firebase modules;
- basic styles.

Запустить build.

## Phase 2

Реализовать Admin Authentication.

Проверить вход/выход.

## Phase 3

Реализовать:

- список учеников;
- добавление ученика;
- publicToken;
- копирование ссылки.

## Phase 4

Реализовать homework и корректное начисление delta.

Это самая важная бизнес-логика.

## Phase 5

Реализовать transaction history.

## Phase 6

Реализовать rewards.

## Phase 7

Реализовать Student Tracker.

## Phase 8

Сделать полноценную волшебную карту.

## Phase 9

Responsive polishing.

## Phase 10

GitHub Pages deployment.

После каждой фазы:

```bash
npm run build
```

Исправить все ошибки до перехода дальше.

---

# 52. Приоритеты

При конфликте требований использовать такой порядок:

1. безопасность данных;
2. правильный подсчёт баллов;
3. простота работы преподавателя;
4. понятность интерфейса ребёнка;
5. визуальная красота;
6. дополнительные эффекты.

---

# 53. Definition of Done

MVP считается готовым, когда преподаватель может:

1. открыть `/admin/`;
2. войти;
3. добавить ученика;
4. получить его персональную ссылку;
5. добавить ДЗ `3/5`;
6. увидеть начисление `+3`;
7. изменить его на `5/5`;
8. увидеть начисление только `+2`;
9. выдать награду;
10. увидеть корректное списание баланса;
11. открыть историю операций;
12. скопировать ссылку ребёнку.

Ученик по своей ссылке должен увидеть:

1. своё имя;
2. текущий баланс кристаллов;
3. волшебную карту;
4. своё текущее положение;
5. сколько осталось до следующей точки;
6. последнее ДЗ;
7. доступные награды.

При этом ученик не должен иметь возможности:

- редактировать данные;
- увидеть других учеников;
- получить список учеников;
- попасть в админку без Authentication.

---

# 54. Перед началом работы

Сначала:

1. прочитай всё ТЗ;
2. исследуй текущий repository;
3. составь короткий implementation plan;
4. проверь существующие файлы перед перезаписью;
5. создай `AGENTS.md`;
6. реализуй проект по фазам;
7. самостоятельно запускай build и исправляй ошибки;
8. не останавливайся после генерации файлов — доведи MVP до рабочего build.

Если для продолжения действительно не хватает Firebase config или другого значения, не придумывай его. Создай понятный placeholder и укажи в README, что именно должен вставить пользователь.
