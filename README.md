# Magic Progress

Magic Progress — один Vite-проект с публичной волшебной картой ученика (`/`) и закрытой панелью преподавателя (`/admin/`). Ученик открывает персональную ссылку без регистрации, а преподаватель управляет учениками, домашними заданиями, кристаллами и наградами через Firebase Authentication и Firestore.

## Локальный запуск

Установите Node.js 20 или новее, откройте терминал в папке проекта и выполните:

```bash
npm install
npm run dev
```

Vite покажет локальный адрес. Главная страница — трекер, админка — `/admin/`.

## Production build

```bash
npm run build
```

Результат появится в `dist`. Проверить его локально можно командой `npm run preview`.

## Настройка Firebase

Проект использует две зарегистрированные Firebase Web App из одного Firebase project `magic-progress`.

1. В Firebase Console откройте Project settings → Your apps → **Magic Map Student**.
2. Скопируйте объект `firebaseConfig` и замените placeholder в `src/firebase/studentFirebase.js`.
3. Откройте настройки **Magic Map Editor**.
4. Скопируйте его `firebaseConfig` в `src/firebase/adminFirebase.js`.

Firebase web config не является секретным. Не добавляйте в проект пароль администратора, service account JSON или private key Admin SDK.

## Firebase Authentication

В Firebase Console включите Authentication → Sign-in method → Email/Password. Если преподаватель входит по логину `julia`, создайте Auth-пользователя с email:

```text
julia@magic-progress.local
```

Скопируйте UID пользователя и создайте документ `admins/{UID}`:

```text
role: "admin"
active: true
```

Документ администратора нельзя читать из клиентского приложения; Firestore Rules проверяют его на серверной стороне.

## Firestore Rules

Правила находятся в `firestore.rules`. Опубликуйте их через Firebase Console → Firestore Database → Rules либо Firebase CLI. Они закрывают `students`, домашки и историю от публичного доступа; по персональному токену разрешён только `get` конкретного активного `publicProfile`.

## GitHub Pages

Workflow `.github/workflows/deploy.yml` собирает и публикует проект после push в `main` или `master`.

1. Отправьте репозиторий на GitHub.
2. Откройте Settings → Pages.
3. В Source выберите **GitHub Actions**.
4. Сделайте push в основную ветку или запустите workflow вручную.

Vite использует относительный `base`, поэтому `/` и `/admin/`, CSS, JavaScript и карта работают при размещении в подкаталоге GitHub Pages.

## Проверки

```bash
npm test
```

Тесты проверяют delta домашки, расчёт точек карты, преобразование логина и валидацию чисел.
