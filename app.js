(() => {
  const ball = document.querySelector('#basketball');
  const spin = document.querySelector('#ball-spin');
  const shadow = document.querySelector('#ball-shadow');
  const pause = document.querySelector('#motion-toggle');
  const shoot = document.querySelector('#shoot');
  const score = document.querySelector('#score');
  const message = document.querySelector('#shot-message');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let visible = true;
  let lastTime = null;
  let frameId = null;
  let elapsed = 0;
  let shotTime = null;
  let buckets = 0;

  function position(x, y, groundY, scale = 1) {
    ball.setAttribute('transform', `translate(${x} ${y}) scale(${scale})`);
    spin.setAttribute('transform', `rotate(${elapsed * .12})`);
    shadow.setAttribute('cx', x);
    shadow.setAttribute('cy', groundY);
    shadow.setAttribute('rx', 24 * scale);
  }
  function finishShot() {
    shotTime = null;
    buckets++;
    score.textContent = String(buckets).padStart(2, '0');
    message.textContent = buckets === 1 ? 'Nothing but net.' : `${buckets} buckets. Keep it going.`;
    shoot.disabled = false;
    position(560, 395, 420);
  }
  function render() {
    if (shotTime !== null) {
      const t = Math.min(shotTime / 1100, 1);
      position(560 + 310 * t, 395 - 67 * t - 250 * Math.sin(Math.PI * t), 420 - 92 * t, 1 - .5 * t);
      if (t === 1) finishShot();
    } else {
      position(560 + Math.sin(elapsed / 1800) * 60, 392 - Math.abs(Math.sin(elapsed / 250)) * 46, 420);
    }
  }
  function frame(time) {
    frameId = null;
    if (paused || !visible || document.hidden) { lastTime = null; return; }
    const delta = lastTime === null ? 0 : Math.min(time - lastTime, 50);
    elapsed += delta;
    if (shotTime !== null) shotTime += delta;
    lastTime = time;
    render();
    frameId = requestAnimationFrame(frame);
  }
  function sync() {
    pause.textContent = paused ? 'Resume motion' : 'Pause motion';
    pause.setAttribute('aria-pressed', String(paused));
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
    lastTime = null;
    if (paused && shotTime !== null) finishShot();
    if (!paused && visible && !document.hidden) frameId = requestAnimationFrame(frame);
  }
  shoot.addEventListener('click', () => {
    if (shotTime !== null) return;
    if (paused || reducedMotion.matches) { finishShot(); return; }
    elapsed = 0;
    shotTime = 0;
    shoot.disabled = true;
    message.textContent = 'Shot’s up…';
  });
  pause.addEventListener('click', () => { paused = !paused; sync(); });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(document.querySelector('.court-wrap'));
  position(560, 395, 420);
  sync();
})();
