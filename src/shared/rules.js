import { escapeHtml } from './formatters.js';

export function rulesMarkup(rewards = [], admin = false) {
  const activeRewards = rewards.filter((reward) => reward.active);
  return `<div class="rules-content">
    <p class="rules-lead">Кристаллы показывают результат регулярной работы и помогают двигаться по волшебной карте.</p>
    <section><span class="rule-number">1</span><div><h3>Как получить кристаллы</h3><p>Одно выполненное задание — один кристалл. Если в домашней работе выполнено 3 задания из 5, начисляется 3 кристалла. Когда оставшиеся задания будут доделаны, начислятся ещё 2.</p></div></section>
    <section><span class="rule-number">2</span><div><h3>Кто начисляет кристаллы</h3><p>Результат отмечает преподаватель после проверки домашней работы. Если результат был указан неверно, преподаватель может сделать корректировку.</p></div></section>
    <section><span class="rule-number">3</span><div><h3>Как работает карта</h3><p>Положение на карте зависит от всех кристаллов, заработанных за всё время. После обмена на приз персонаж не двигается назад.</p></div></section>
    <section><span class="rule-number">4</span><div><h3>Как обменять кристаллы</h3><p>Выбери доступный приз и сообщи преподавателю. Обмен выполняет преподаватель, когда на текущем балансе хватает кристаллов. После подтверждения стоимость приза списывается с баланса.</p></div></section>
    <section><span class="rule-number">5</span><div><h3>На что можно обменять</h3>${activeRewards.length ? `<div class="rules-prizes">${activeRewards.map((reward) => `<span>${escapeHtml(reward.title)} — <b>${reward.cost} кристаллов</b></span>`).join('')}</div>` : '<p>Список призов скоро добавит преподаватель.</p>'}</div></section>
    ${admin ? '<aside><b>Для преподавателя:</b> все изменения баланса выполняются автоматически и сохраняются в истории. При выдаче приза уменьшается только текущий баланс, а общий прогресс остаётся прежним.</aside>' : ''}
  </div>`;
}

export function openRules(rewards = [], admin = false) {
  const dialog = document.createElement('dialog');
  dialog.className = 'rules-dialog';
  dialog.innerHTML = `<div class="rules-dialog-head"><div><p>MAGIC PROGRESS</p><h2>Правила кристаллов</h2></div><button type="button" aria-label="Закрыть">×</button></div>${rulesMarkup(rewards, admin)}`;
  document.body.append(dialog);
  dialog.querySelector('button').onclick = () => dialog.close();
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => dialog.remove());
  dialog.showModal();
}
