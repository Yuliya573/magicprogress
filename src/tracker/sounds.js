let context;
let enabled = localStorage.getItem('magic-progress-sound') === 'on';

function audioContext() {
  context ??= new (window.AudioContext || window.webkitAudioContext)();
  return context;
}

function tone(frequency, start, duration, volume = 0.08, type = 'sine') {
  const audio = audioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audio.currentTime + start);
  gain.gain.setValueAtTime(0, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(volume, audio.currentTime + start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + start + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(audio.currentTime + start);
  oscillator.stop(audio.currentTime + start + duration + 0.02);
}

export function playCrystal() {
  if (!enabled) return;
  tone(660, 0, .18, .06);
  tone(990, .09, .25, .045);
  tone(1320, .18, .32, .03);
}

export function playJourney() {
  if (!enabled) return;
  tone(392, 0, .28, .045, 'triangle');
  tone(523, .12, .32, .045, 'triangle');
  tone(784, .25, .5, .04, 'sine');
}

export function attachSoundControls(root) {
  const button = root.querySelector('#sound-toggle');
  const update = () => {
    button.setAttribute('aria-pressed', String(enabled));
    button.innerHTML = enabled ? '<span>♪</span> Звук включён' : '<span>♪</span> Включить звук';
  };
  update();
  button.addEventListener('click', async () => {
    enabled = !enabled;
    localStorage.setItem('magic-progress-sound', enabled ? 'on' : 'off');
    if (enabled) {
      await audioContext().resume();
      playJourney();
    }
    update();
  });
  root.querySelectorAll('.reward-grid article').forEach((card) => card.addEventListener('pointerenter', playCrystal));
}
