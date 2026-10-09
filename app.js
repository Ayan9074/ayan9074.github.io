(() => {
  const path = document.querySelector('#lap-path');
  const runner = document.querySelector('#runner');
  const facing = document.querySelector('#runner-facing');
  const pauseButton = document.querySelector('#motion-toggle');
  const paceButton = document.querySelector('#pace-toggle');
  const lapCount = document.querySelector('#lap-count');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const length = path.getTotalLength();
  let paused = reducedMotion.matches;
  let speed = 1;
  let travelled = 135;
  let lastTime = null;
  let inView = true;
  let frameId = null;

  function render() {
    const distance = travelled % length;
    const position = path.getPointAtLength(distance);
    const ahead = path.getPointAtLength((distance + 2) % length);
    const direction = ahead.x >= position.x ? 1 : -1;
    const bounce = paused ? 0 : Math.sin(travelled / 9) * 3;
    runner.setAttribute('transform', `translate(${position.x} ${position.y + bounce})`);
    facing.setAttribute('transform', `scale(${direction} 1)`);
    lapCount.textContent = `LAP ${String(Math.floor(travelled / length) + 1).padStart(2, '0')}`;
  }
  function frame(time) {
    frameId = null;
    if (paused || !inView || document.hidden) { lastTime = null; return; }
    if (lastTime !== null) travelled += Math.min(time - lastTime, 50) * .075 * speed;
    lastTime = time;
    render();
    frameId = requestAnimationFrame(frame);
  }
  function sync() {
    pauseButton.textContent = paused ? 'Start runner' : 'Pause runner';
    pauseButton.setAttribute('aria-pressed', String(paused));
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
    lastTime = null;
    render();
    if (!paused && inView && !document.hidden) frameId = requestAnimationFrame(frame);
  }
  pauseButton.addEventListener('click', () => { paused = !paused; sync(); });
  paceButton.addEventListener('click', () => {
    speed = speed === 1 ? 2 : 1;
    paceButton.textContent = `Pace: ${speed}×`;
    paceButton.setAttribute('aria-label', `Change animation speed, currently ${speed} times`);
  });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(document.querySelector('.track-wrap'));
  sync();
})();
