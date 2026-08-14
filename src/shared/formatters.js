export function loginToEmail(login) {
  const value = login.trim().toLowerCase();
  return value.includes('@') ? value : `${value}@magic-progress.local`;
}

export function defaultHomeworkTitle(date = new Date()) {
  return `Домашнее задание — ${new Intl.DateTimeFormat('ru-RU').format(date)}`;
}

export function formatDate(value) {
  const date = value?.toDate?.() ?? (value ? new Date(value) : null);
  return date && !Number.isNaN(date.valueOf()) ? new Intl.DateTimeFormat('ru-RU').format(date) : '—';
}

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
