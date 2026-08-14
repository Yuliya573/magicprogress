import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHomeworkDelta, getCurrentMapStop, getNextMapStop, getCrystalsToNextStop, validateHomework, validateReward } from '../src/shared/calculations.js';
import { loginToEmail } from '../src/shared/formatters.js';

const stops = [{ id:'start', required:0 }, { id:'forest', required:5 }, { id:'castle', required:10 }];
test('homework начисляет только разницу', () => {
  assert.equal(calculateHomeworkDelta(0, 3), 3);
  assert.equal(calculateHomeworkDelta(3, 5), 2);
  assert.equal(calculateHomeworkDelta(5, 4), -1);
});
test('карта зависит от totalEarned', () => {
  assert.equal(getCurrentMapStop(7, stops).id, 'forest');
  assert.equal(getNextMapStop(7, stops).id, 'castle');
  assert.equal(getCrystalsToNextStop(7, stops), 3);
  assert.equal(getNextMapStop(10, stops), null);
});
test('логин преобразуется в email', () => {
  assert.equal(loginToEmail(' Julia '), 'julia@magic-progress.local');
  assert.equal(loginToEmail('Teacher@example.com'), 'teacher@example.com');
});
test('валидация отклоняет некорректные данные', () => {
  assert.throws(() => validateHomework(6, 5));
  assert.throws(() => validateHomework(1, 0));
  assert.throws(() => validateReward(0));
  assert.doesNotThrow(() => validateHomework(3, 5));
  assert.doesNotThrow(() => validateReward(10));
});
