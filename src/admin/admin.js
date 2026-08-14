import './admin.css';
import './admin-v2.css';
import { watchAdmin, login, logout } from './auth.js';
import { isAdminConfigured } from '../firebase/adminFirebase.js';
import { createPublicLink, createStudent, listStudents, setStudentActive, trackerUrl } from './students.js';
import { listHomeworks, saveHomework } from './homework.js';
import { grantReward, listRewards, saveReward, setRewardActive } from './rewards.js';
import { listTransactions } from './transactions.js';
import { calculateHomeworkDelta } from '../shared/calculations.js';
import { escapeHtml, formatDate } from '../shared/formatters.js';

const app = document.querySelector('#admin-app');
const toast = document.querySelector('#toast');
let students = [];
let rewards = [];
const demoStudent = { id: 'demo', displayName: 'Маша', balance: 14, totalEarned: 29, active: true, publicToken: 'demo' };

function notify(text) {
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

function handleError(error) {
  console.error(error);
  notify(error.message || 'Не удалось выполнить действие');
}

async function withLock(button, action) {
  const label = button.textContent;
  button.disabled = true;
  button.textContent = 'Сохраняем…';
  try { return await action(); }
  finally { button.disabled = false; button.textContent = label; }
}

function openDialog(html, setup) {
  const dialog = document.createElement('dialog');
  dialog.innerHTML = `<div class="dialog-body">${html}</div>`;
  document.body.append(dialog);
  dialog.addEventListener('close', () => dialog.remove());
  dialog.querySelectorAll('[data-close]').forEach((button) => { button.onclick = () => dialog.close(); });
  setup(dialog);
  dialog.showModal();
}

function renderLogin(note = '') {
  app.innerHTML = `<section class="login"><form class="panel"><div class="brand">✦</div><p class="kicker">MAGIC PROGRESS</p><h1>Вход для преподавателя</h1>${note ? `<div class="notice">${escapeHtml(note)}</div>` : ''}<label>Логин<input name="login" autocomplete="username" required></label><label>Пароль<div class="password"><input name="password" type="password" autocomplete="current-password" required><button type="button" id="show-password">Показать</button></div></label><button class="primary full" type="submit">Войти</button><button class="demo-button full" type="button" id="open-demo">Открыть демо без входа</button><p class="error" role="alert"></p></form></section>`;
  const form = app.querySelector('form');
  app.querySelector('#show-password').onclick = (event) => {
    form.password.type = form.password.type === 'password' ? 'text' : 'password';
    event.currentTarget.textContent = form.password.type === 'password' ? 'Показать' : 'Скрыть';
  };
  app.querySelector('#open-demo').onclick = renderDemoAdmin;
  form.onsubmit = async (event) => {
    event.preventDefault();
    try { await withLock(form.querySelector('[type=submit]'), () => login(form.login.value, form.password.value)); }
    catch (error) { console.error(error); form.querySelector('.error').textContent = 'Неверный логин или пароль'; }
  };
}

function renderDemoAdmin() {
  app.innerHTML = `<header class="topbar"><span class="logo">✦ Magic Progress <small>ДЕМО</small></span><nav><a class="nav-link" href="../?demo=1">Карта ученика</a><button id="close-demo">Закрыть демо</button></nav></header><div class="workspace"><div class="page-head"><div><p class="kicker">ДЕМОНСТРАЦИЯ</p><h1>Ученики</h1></div><button class="primary" data-demo>+ Добавить ученика</button></div><div class="toolbar"><label>Поиск <input value="Маша"></label><label><input type="checkbox"> Показать архивных</label></div><div class="cards"><article class="student-card"><div class="avatar">М</div><div><h2>${demoStudent.displayName}</h2><p>💎 Баланс: <b>${demoStudent.balance}</b> · 🗺 Пройдено: <b>${demoStudent.totalEarned}</b></p></div><div class="card-actions"><button id="demo-open">Открыть</button><a class="button-link" href="../?demo=1">Открыть карту</a></div></article></div><section class="panel demo-help"><h2>Это демонстрационные данные</h2><p>Можно осмотреть интерфейс без Firebase. Для настоящей работы вставьте Firebase config в файлы проекта.</p></section></div>`;
  app.querySelector('#close-demo').onclick = () => renderLogin(!isAdminConfigured ? 'Добавьте конфигурацию Firebase, чтобы войти.' : '');
  app.querySelector('#demo-open').onclick = renderDemoStudent;
  app.querySelectorAll('[data-demo]').forEach((button) => { button.onclick = () => notify('В демо-режиме данные не сохраняются'); });
}

function renderDemoStudent() {
  app.innerHTML = `<header class="topbar"><span class="logo">✦ Magic Progress <small>ДЕМО</small></span><nav><button id="demo-back">Ученики</button><button id="close-demo">Закрыть демо</button></nav></header><div class="workspace"><button class="back" id="back">← Все ученики</button><div class="student-title"><div class="avatar big">М</div><div><h1>Маша</h1><p>Активный ученик</p></div></div><div class="stats"><article><span>Баланс</span><strong>14 💎</strong></article><article><span>Всего заработано</span><strong>29</strong></article></div><section class="panel link"><div><h2>Персональная ссылка</h2><p>Демонстрационная карта ученика</p></div><a class="button-link" href="../?demo=1">Открыть карту</a></section><div class="columns"><section class="panel"><div class="section-title"><h2>Домашние задания</h2><button class="primary" data-demo>+ Добавить ДЗ</button></div><div class="table"><div class="row"><span>Домашнее задание — 13.08.2026</span><b>3 / 5</b><span class="positive">+3 💎</span><button data-demo>Изменить</button></div></div></section><section class="panel"><h2>Выдать награду</h2><div class="reward-list"><button data-demo><span>🎲</span>Игра на уроке<b>10 💎</b></button><button disabled><span>🎁</span>Таинственный подарок<b>20 💎</b></button></div></section></div><section class="panel"><h2>История операций</h2><div class="table"><div class="row transaction"><span>13.08.2026</span><span>Домашнее задание</span><b class="positive">+3 💎</b></div></div></section></div>`;
  app.querySelector('#back').onclick = renderDemoAdmin; app.querySelector('#demo-back').onclick = renderDemoAdmin; app.querySelector('#close-demo').onclick = () => renderLogin(!isAdminConfigured ? 'Добавьте конфигурацию Firebase, чтобы войти.' : '');
  app.querySelectorAll('[data-demo]').forEach((button) => { button.onclick = () => notify('В демо-режиме данные не сохраняются'); });
}

function renderShell(content, active = 'students') {
  app.innerHTML = `<header class="topbar"><a class="logo" href="#">✦ Magic Progress</a><nav><button data-page="students" class="${active === 'students' ? 'active' : ''}">Ученики</button><button data-page="rewards" class="${active === 'rewards' ? 'active' : ''}">Награды</button><button id="logout">Выйти</button></nav></header><div class="workspace">${content}</div>`;
  app.querySelector('#logout').onclick = logout;
  app.querySelectorAll('[data-page]').forEach((button) => {
    button.onclick = () => button.dataset.page === 'students' ? renderStudents() : renderRewards();
  });
}

async function refresh(showArchived = false) {
  [students, rewards] = await Promise.all([listStudents(showArchived), listRewards(false)]);
}

function renderStudents() {
  const active = students.filter((student) => student.active);
  const balance = active.reduce((sum, student) => sum + student.balance, 0);
  const earned = active.reduce((sum, student) => sum + student.totalEarned, 0);
  renderShell(`<div class="admin-heading"><div><p class="kicker">ПАНЕЛЬ ПРЕПОДАВАТЕЛЯ</p><h1>Добро пожаловать в Magic Progress</h1><p>Управляйте учебным путешествием учеников</p></div><button class="primary" id="add-student">＋ Добавить ученика</button></div><section class="metric-grid" aria-label="Общая статистика"><article class="metric blue"><span>♟</span><div><p>Активные ученики</p><strong>${active.length}</strong></div></article><article class="metric cyan"><span>💎</span><div><p>Текущий баланс</p><strong>${balance}</strong></div></article><article class="metric violet"><span>✦</span><div><p>Всего заработано</p><strong>${earned}</strong></div></article><article class="metric gold"><span>🎁</span><div><p>Активные награды</p><strong>${rewards.filter((reward) => reward.active).length}</strong></div></article></section><section class="student-directory"><div class="directory-head"><div><p class="kicker">УЧЕБНОЕ ПУТЕШЕСТВИЕ</p><h2>Ученики</h2></div><div class="toolbar"><label class="search-label"><span>⌕</span><input id="search" placeholder="Найти ученика"></label><label class="archive-toggle"><input id="show-archived" type="checkbox"> Архив</label></div></div><div class="cards" id="student-cards"></div></section>`);
  const draw = (items) => {
    const cards = app.querySelector('#student-cards');
    cards.innerHTML = items.length ? items.map((student) => `<article class="student-card"><div class="avatar">${escapeHtml(student.displayName[0] || '?')}</div><div class="student-main"><h2>${escapeHtml(student.displayName)}</h2><p class="status"><i class="${student.active ? 'online' : ''}"></i>${student.active ? 'Активный ученик' : 'В архиве'}</p></div><div class="student-numbers"><span><small>Баланс</small><b>${student.balance} 💎</b></span><span><small>Пройдено</small><b>${student.totalEarned} ✦</b></span></div><div class="card-actions"><button data-copy="${student.id}" ${student.publicToken ? '' : 'disabled'} title="Скопировать ссылку">⛓</button><button class="open-button" data-open="${student.id}">Открыть →</button></div></article>`).join('') : '<div class="empty-panel">Ученики не найдены</div>';
    cards.querySelectorAll('[data-open]').forEach((button) => { button.onclick = () => renderStudent(items.find((student) => student.id === button.dataset.open)); });
    cards.querySelectorAll('[data-copy]').forEach((button) => { button.onclick = () => copyLink(items.find((student) => student.id === button.dataset.copy)); });
  };
  draw(students);
  app.querySelector('#search').oninput = (event) => draw(students.filter((student) => student.displayName.toLowerCase().includes(event.target.value.toLowerCase())));
  app.querySelector('#show-archived').onchange = async (event) => { await refresh(event.target.checked); draw(students); };
  app.querySelector('#add-student').onclick = showStudentForm;
}

function showStudentForm() {
  openDialog(`<h2>Новый ученик</h2><form><label>Имя<input name="displayName" required></label><label>Стартовый баланс<input name="balance" type="number" min="0" step="1" value="0" required></label><label>Всего заработано<input name="totalEarned" type="number" min="0" step="1" value="0" required></label><div class="dialog-actions"><button type="button" data-close>Отмена</button><button class="primary" type="submit">Создать</button></div></form>`, (dialog) => {
    const form = dialog.querySelector('form');
    form.balance.oninput = () => { if (!form.totalEarned.dataset.manual) form.totalEarned.value = form.balance.value; };
    form.totalEarned.oninput = () => { form.totalEarned.dataset.manual = 'true'; };
    form.onsubmit = async (event) => {
      event.preventDefault();
      try {
        await withLock(form.querySelector('[type=submit]'), () => createStudent({ displayName: form.displayName.value, balance: Number(form.balance.value), totalEarned: Number(form.totalEarned.value) }));
        dialog.close(); await refresh(); renderStudents(); notify('✓ Ученик создан');
      } catch (error) { handleError(error); }
    };
  });
}

async function copyLink(student) {
  try { await navigator.clipboard.writeText(trackerUrl(student.publicToken)); notify('✓ Ссылка скопирована'); }
  catch (error) { handleError(error); }
}

async function renderStudent(student) {
  const [homeworks, history] = await Promise.all([listHomeworks(student.id), listTransactions(student.id)]);
  renderShell(`<button class="back" id="back">← Все ученики</button><div class="student-title"><div class="avatar big">${escapeHtml(student.displayName[0] || '?')}</div><div><h1>${escapeHtml(student.displayName)}</h1><p>${student.active ? 'Активный ученик' : 'В архиве'}</p></div></div><div class="stats"><article><span>Баланс</span><strong>${student.balance} 💎</strong></article><article><span>Всего заработано</span><strong>${student.totalEarned}</strong></article></div><section class="panel link">${student.publicToken ? `<div><h2>Персональная ссылка</h2><p>${escapeHtml(trackerUrl(student.publicToken))}</p></div><button id="copy">Скопировать</button>` : '<p>У ученика пока нет публичной ссылки.</p><button id="create-link">Создать ссылку</button>'}</section><div class="columns"><section class="panel"><div class="section-title"><h2>Домашние задания</h2><button class="primary" id="add-homework">+ Добавить ДЗ</button></div><div class="table">${homeworks.map((item) => `<div class="row"><span>${escapeHtml(item.title)}</span><b>${item.completedTasks} / ${item.totalTasks}</b><span class="positive">+${item.pointsAwarded} 💎</span><button data-edit="${item.id}">Изменить</button></div>`).join('') || '<p class="muted">Пока нет записей</p>'}</div></section><section class="panel"><h2>Выдать награду</h2><div class="reward-list">${rewards.filter((reward) => reward.active).map((reward) => `<button data-grant="${reward.id}" ${student.balance < reward.cost ? 'disabled' : ''}><span>${escapeHtml(reward.emoji || '🎁')}</span>${escapeHtml(reward.title)}<b>${reward.cost} 💎</b></button>`).join('') || '<p class="muted">Нет активных наград</p>'}</div></section></div><section class="panel"><h2>История операций</h2><div class="table">${history.map((item) => `<div class="row transaction"><span>${formatDate(item.createdAt)}</span><span>${escapeHtml(item.description)}</span><b class="${item.amount >= 0 ? 'positive' : 'negative'}">${item.amount > 0 ? '+' : ''}${item.amount} 💎</b></div>`).join('') || '<p class="muted">История пуста</p>'}</div></section><button class="danger-subtle" id="archive">${student.active ? 'Архивировать' : 'Восстановить'}</button>`);
  app.querySelector('#back').onclick = renderStudents;
  if (student.publicToken) app.querySelector('#copy').onclick = () => copyLink(student);
  else app.querySelector('#create-link').onclick = async () => { try { student.publicToken = await createPublicLink(student); await renderStudent(student); notify('✓ Ссылка создана'); } catch (error) { handleError(error); } };
  app.querySelector('#add-homework').onclick = () => showHomeworkForm(student);
  app.querySelectorAll('[data-edit]').forEach((button) => { button.onclick = () => showHomeworkForm(student, homeworks.find((item) => item.id === button.dataset.edit)); });
  app.querySelectorAll('[data-grant]').forEach((button) => { button.onclick = () => giveReward(student, rewards.find((reward) => reward.id === button.dataset.grant), button); });
  app.querySelector('#archive').onclick = async () => { try { await setStudentActive(student, !student.active); await refresh(); renderStudents(); notify('✓ Сохранено'); } catch (error) { handleError(error); } };
}

function showHomeworkForm(student, existing = null) {
  openDialog(`<h2>${existing ? 'Изменить' : 'Добавить'} ДЗ</h2><form><label>Название<input name="title" value="${escapeHtml(existing?.title || '')}"></label><div class="ratio"><label>Выполнено<input name="completed" type="number" min="0" step="1" value="${existing?.completedTasks ?? 0}" required></label><span>из</span><label>Всего<input name="total" type="number" min="1" step="1" value="${existing?.totalTasks ?? 5}" required></label></div><p class="delta"></p><div class="dialog-actions"><button type="button" data-close>Отмена</button><button class="primary" type="submit">Сохранить</button></div></form>`, (dialog) => {
    const form = dialog.querySelector('form');
    const preview = () => {
      const delta = calculateHomeworkDelta(existing?.pointsAwarded ?? 0, Number(form.completed.value));
      dialog.querySelector('.delta').textContent = delta > 0 ? `Будет начислено: +${delta} 💎` : delta < 0 ? `Корректировка: −${Math.abs(delta)} 💎` : 'Баланс не изменится';
    };
    form.completed.oninput = preview; preview();
    form.onsubmit = async (event) => {
      event.preventDefault();
      try {
        const delta = await withLock(form.querySelector('[type=submit]'), () => saveHomework(student, { title: form.title.value, completedTasks: Number(form.completed.value), totalTasks: Number(form.total.value) }, existing));
        dialog.close(); await refresh(); await renderStudent(students.find((item) => item.id === student.id)); notify(`✓ ${delta >= 0 ? `Начислено +${delta}` : `Корректировка ${delta}`} 💎`);
      } catch (error) { handleError(error); }
    };
  });
}

async function giveReward(student, reward, button) {
  if (!confirm(`Списать ${reward.cost} 💎 у ${student.displayName} за «${reward.title}»?`)) return;
  try { await withLock(button, () => grantReward(student, reward)); await refresh(); await renderStudent(students.find((item) => item.id === student.id)); notify(`✓ Списано ${reward.cost} 💎`); }
  catch (error) { handleError(error); }
}

function renderRewards() {
  renderShell(`<div class="page-head"><div><p class="kicker">КАТАЛОГ</p><h1>Награды</h1></div><button class="primary" id="add-reward">+ Добавить награду</button></div><div class="cards">${rewards.map((reward) => `<article class="student-card ${reward.active ? '' : 'archived'}"><div class="reward-emoji">${escapeHtml(reward.emoji || '🎁')}</div><div><h2>${escapeHtml(reward.title)}</h2><p>${reward.cost} 💎 · ${reward.active ? 'Активна' : 'В архиве'}</p></div><div class="card-actions"><button data-edit-reward="${reward.id}">Изменить</button><button data-toggle-reward="${reward.id}">${reward.active ? 'Архивировать' : 'Восстановить'}</button></div></article>`).join('') || '<div class="empty-panel">Наград пока нет</div>'}</div>`, 'rewards');
  app.querySelector('#add-reward').onclick = () => showRewardForm();
  app.querySelectorAll('[data-edit-reward]').forEach((button) => { button.onclick = () => showRewardForm(rewards.find((item) => item.id === button.dataset.editReward)); });
  app.querySelectorAll('[data-toggle-reward]').forEach((button) => { button.onclick = async () => { const reward = rewards.find((item) => item.id === button.dataset.toggleReward); try { await setRewardActive(reward.id, !reward.active); await refresh(); renderRewards(); notify('✓ Сохранено'); } catch (error) { handleError(error); } }; });
}

function showRewardForm(existing = {}) {
  openDialog(`<h2>${existing.id ? 'Изменить' : 'Новая'} награда</h2><form><label>Название<input name="title" value="${escapeHtml(existing.title || '')}" required></label><label>Эмодзи<input name="emoji" value="${escapeHtml(existing.emoji || '🎁')}" required></label><label>Стоимость<input name="cost" type="number" min="1" step="1" value="${existing.cost || 10}" required></label><div class="dialog-actions"><button type="button" data-close>Отмена</button><button class="primary" type="submit">Сохранить</button></div></form>`, (dialog) => {
    const form = dialog.querySelector('form');
    form.onsubmit = async (event) => { event.preventDefault(); try { await withLock(form.querySelector('[type=submit]'), () => saveReward({ ...existing, title: form.title.value, emoji: form.emoji.value, cost: Number(form.cost.value) })); dialog.close(); await refresh(); renderRewards(); notify('✓ Сохранено'); } catch (error) { handleError(error); } };
  });
}

if (!isAdminConfigured) renderLogin('Добавьте конфигурацию Firebase, чтобы войти.');
else watchAdmin(async (user) => { if (!user) return renderLogin(); try { await refresh(); renderStudents(); } catch (error) { handleError(error); } }, (error) => renderLogin(error.message));
