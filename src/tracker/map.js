import { getCurrentMapStop } from '../shared/calculations.js';
import { escapeHtml } from '../shared/formatters.js';
import { YEAR_CRYSTAL_CAPACITY, YEAR_MILESTONE_COUNT } from '../data/mapStops.js';

// Coordinates follow the painted road from the village at the bottom to the summit.
const routeAnchors = [
  [48,94],[43,88],[41,81],[35,74],[46,68],[52,61],[40,55],
  [42,48],[49,42],[51,35],[48,28],[52,21],[54,14],[54,8]
];

function pointOnRoute(progress) {
  const scaled = Math.max(0, Math.min(1, progress)) * (routeAnchors.length - 1);
  const index = Math.min(Math.floor(scaled), routeAnchors.length - 2);
  const part = scaled - index;
  const [x1,y1] = routeAnchors[index];
  const [x2,y2] = routeAnchors[index + 1];
  return { x: x1 + (x2 - x1) * part, y: y1 + (y2 - y1) * part };
}

export function renderMap(totalEarned, stops) {
  const current = getCurrentMapStop(totalEarned, stops);
  const progress = Math.min(totalEarned / YEAR_CRYSTAL_CAPACITY, 1);
  const currentMilestone = Math.floor(progress * (YEAR_MILESTONE_COUNT - 1));
  const markers = Array.from({ length: YEAR_MILESTONE_COUNT }, (_, index) => {
    const point = pointOnRoute(index / (YEAR_MILESTONE_COUNT - 1));
    const state = index < currentMilestone ? 'passed' : index === currentMilestone ? 'current' : 'future';
    const required = Math.round(index * YEAR_CRYSTAL_CAPACITY / (YEAR_MILESTONE_COUNT - 1));
    return `<span class="journey-dot ${state}" style="--x:${point.x}%;--y:${point.y}%" title="Этап ${index + 1}: ${required} 💎" aria-hidden="true"></span>`;
  }).join('');
  return `<div class="map" role="img" aria-label="Карта учебного года. Текущая локация: ${escapeHtml(current.label)}. Заработано ${totalEarned} из ${YEAR_CRYSTAL_CAPACITY} кристаллов.">
    <div class="map-shade"></div>${markers}
    ${stops.map((stop) => { const state=stop.id===current.id?'current':stop.required<=totalEarned?'passed':'future'; return `<div class="map-stop ${state}" style="--x:${stop.x}%;--y:${stop.y}%"><span class="stop-icon">${stop.icon}</span><span class="stop-label">${escapeHtml(stop.label)}</span>${state==='current'?`<b>${totalEarned} 💎 · ТЫ ЗДЕСЬ</b>`:''}</div>`; }).join('')}
    <div class="year-scale"><span>Начало пути</span><strong>${Math.min(totalEarned,YEAR_CRYSTAL_CAPACITY)} / ${YEAR_CRYSTAL_CAPACITY} 💎</strong><span>Вершина</span></div>
  </div>`;
}
