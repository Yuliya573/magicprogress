export function calculateHomeworkDelta(oldPoints, newCompleted) {
  if (![oldPoints, newCompleted].every(Number.isInteger)) throw new TypeError('Баллы должны быть целыми числами');
  return newCompleted - oldPoints;
}

export function getCurrentMapStop(totalEarned, stops) {
  return [...stops].filter((stop) => stop.required <= totalEarned).at(-1) ?? stops[0] ?? null;
}

export function getNextMapStop(totalEarned, stops) {
  return stops.find((stop) => stop.required > totalEarned) ?? null;
}

export function getCrystalsToNextStop(totalEarned, stops) {
  const next = getNextMapStop(totalEarned, stops);
  return next ? Math.max(0, next.required - totalEarned) : 0;
}

export function validateHomework(completed, total) {
  if (!Number.isInteger(completed) || !Number.isInteger(total) || total <= 0 || completed < 0 || completed > total) {
    throw new Error('Укажите целые значения: выполнено — от 0 до общего количества');
  }
}

export function validateReward(cost) {
  if (!Number.isInteger(cost) || cost <= 0) throw new Error('Стоимость должна быть целым числом больше нуля');
}
