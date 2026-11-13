(() => {
  const dialog = document.getElementById('project-video-dialog');
  const player = document.getElementById('project-video-player');
  const title = document.getElementById('project-video-title');
  const close = document.getElementById('project-video-close');
  const fallback = document.getElementById('project-video-fallback');
  let trigger = null;
  let previousOverflow = '';

  function localize() {
    const zh = document.documentElement.lang.startsWith('zh');
    document.querySelectorAll('[data-media-en]').forEach(element => {
      element.textContent = zh ? element.dataset.mediaZh : element.dataset.mediaEn;
    });
    document.querySelectorAll('[data-media-aria-en]').forEach(element => {
      element.setAttribute('aria-label', zh ? element.dataset.mediaAriaZh : element.dataset.mediaAriaEn);
    });
    close.setAttribute('aria-label', zh ? '关闭视频' : 'Close video');
    if (trigger) player.setAttribute('aria-label', trigger.dataset.videoTitle + (zh ? ' · 英文配音' : ' · English narration'));
  }
  localize();
  new MutationObserver(localize).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  document.querySelectorAll('[data-video-trigger]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !dialog.showModal) return;
      event.preventDefault();
      trigger = link;
      title.textContent = link.dataset.videoTitle;
      fallback.href = link.href;
      player.poster = link.querySelector('img').src;
      player.src = link.dataset.video;
      const captions = document.createElement('track');
      captions.kind = 'captions';
      captions.srclang = 'en';
      captions.label = 'English';
      captions.src = link.dataset.captions;
      player.append(captions);
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      localize();
      close.focus();
      player.play().catch(() => { /* Native controls and the dedicated page remain available. */ });
    });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    player.pause();
    player.removeAttribute('src');
    player.querySelectorAll('track').forEach(track => track.remove());
    player.load();
    document.body.style.overflow = previousOverflow;
    trigger?.focus({ preventScroll: true });
    trigger = null;
  });
})();


if ('IntersectionObserver' in window) {
  function revealOnce(selector, bottomMargin) {
    const observer = new IntersectionObserver((entries, source) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-entered');
        source.unobserve(entry.target);
      });
    }, { rootMargin: `0px 0px -${bottomMargin}% 0px` });
    document.querySelectorAll(selector).forEach(element => observer.observe(element));
  }

  revealOnce('.work__image-box', 15);
  revealOnce('.about p:has(.research-highlight), .work [data-i18n]:has(.research-highlight)', 20);
}

// Motion Prompt #084 · MIT License (c) 2026 Shohei Ohtaki
const magneticButtons = Array.from(document.querySelectorAll('[data-magnetic]'), button => ({
  button,
  anchor: button.parentElement,
  radius: button.dataset.magnetic === 'soft' ? 64 : 110,
  pull: button.dataset.magnetic === 'soft' ? 0.14 : 0.35,
  target: null,
  offset: [0, 0]
}));
const magneticPointer = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
let magneticFrame = 0;
let lastFrame;
const movingButtons = new Set();

function moveMagneticButtons(now) {
  const elapsed = lastFrame === undefined ? 1000 / 60 : now - lastFrame;
  lastFrame = now;
  const follow = 1 - Math.pow(0.82, elapsed / (1000 / 60));

  for (const state of movingButtons) {
    let settled;
    if (state.target) {
      state.offset = state.offset.map((value, i) => value + (state.target[i] - value) * follow);
      settled = Math.hypot(...state.offset.map((value, i) => value - state.target[i])) < 0.05;
    } else {
      state.returnStart ??= now;
      const progress = Math.min(1, (now - state.returnStart) / 1100);
      const spring = progress === 1 ? 0 : -(2 ** (-10 * progress)) * Math.sin((progress - 0.075) * 2 * Math.PI / 0.3);
      state.offset = state.returnFrom.map(value => value * spring);
      settled = progress === 1;
    }
    state.button.style.setProperty('--magnetic-offset', `${state.offset[0]}px ${state.offset[1]}px`);
    if (settled) movingButtons.delete(state);
  }

  magneticFrame = movingButtons.size ? requestAnimationFrame(moveMagneticButtons) : 0;
  if (!magneticFrame) lastFrame = undefined;
}

function queueMagneticButton(state) {
  movingButtons.add(state);
  if (!magneticFrame) magneticFrame = requestAnimationFrame(moveMagneticButtons);
}

function releaseMagneticButton(state) {
  if (!state.target) return;
  state.target = null;
  state.returnFrom = state.offset;
  state.returnStart = undefined;
  queueMagneticButton(state);
}

function releaseMagneticButtons() {
  magneticButtons.forEach(releaseMagneticButton);
}

window.addEventListener('pointermove', event => {
  if (!magneticPointer.matches || event.pointerType !== 'mouse') return;
  if (document.querySelector('dialog[open]')) {
    releaseMagneticButtons();
    return;
  }

  let closest;
  let shortest = Infinity;
  for (const state of magneticButtons) {
    const rect = state.anchor.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const distance = Math.hypot(x, y);
    if (distance > state.radius || distance >= shortest || state.button.matches(':focus-visible')) continue;
    closest = { state, x, y };
    shortest = distance;
  }

  for (const state of magneticButtons) {
    if (state === closest?.state) {
      state.target = [closest.x * state.pull, closest.y * state.pull];
      queueMagneticButton(state);
    } else {
      releaseMagneticButton(state);
    }
  }
}, { passive: true });

document.documentElement.addEventListener('pointerleave', releaseMagneticButtons);
window.addEventListener('scroll', releaseMagneticButtons, { passive: true });
window.addEventListener('blur', releaseMagneticButtons);
magneticButtons.forEach(state => {
  state.button.addEventListener('focus', () => {
    if (state.button.matches(':focus-visible')) releaseMagneticButton(state);
  });
});
magneticPointer.addEventListener('change', () => {
  cancelAnimationFrame(magneticFrame);
  magneticFrame = 0;
  lastFrame = undefined;
  movingButtons.clear();
  magneticButtons.forEach(state => {
    state.target = null;
    state.offset = [0, 0];
    state.button.style.removeProperty('--magnetic-offset');
  });
});

// Motion Prompt #019 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#019
let themeChanging = false;

function changeTheme(next, applyTheme) {
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyTheme();
    return;
  }

  themeChanging = true;
  const accent = document.createElement('div');
  accent.className = 'theme-liquid';
  accent.style.background = next === 'dark' ? '#526f9e' : '#c97972';
  document.body.append(accent);

  const transition = document.startViewTransition(() => {
    applyTheme();
    accent.classList.add('theme-liquid--visible');
  });

  transition.ready.then(() => {
    const width = innerWidth;
    const height = innerHeight;
    // Interpolate only the vertical position of a fixed, rounded wave.
    // Each layer needs two keyframes and seven curves across the viewport.
    function waveMask(y, bottom, phase) {
      const step = width / 7;
      const edge = Array.from({ length: 7 }, (_, index) => {
        const start = index * step;
        const depth = 28 + 28 * Math.sin(index * 1.7 + phase) ** 2;
        return `C ${start + step * .25} ${y} ${start + step * .26} ${y + depth} ${start + step * .5} ${y + depth}
          S ${start + step * .75} ${y} ${start + step} ${y}`;
      }).join(' ');
      return { clipPath: `path("M 0 ${bottom} L 0 ${y} ${edge} L ${width} ${bottom} Z")` };
    }

    const root = document.documentElement;
    const timing = { easing: 'cubic-bezier(.455,.03,.515,.955)', fill: 'both' };
    root.animate([waveMask(-60, height + 1, 0), waveMask(height + 1, height + 1, 0)], {
      ...timing, duration: 460, pseudoElement: '::view-transition-old(root)'
    });
    root.animate([waveMask(-60, -61, 1), waveMask(height + 1, -61, 1)], {
      ...timing, duration: 460, delay: 140, pseudoElement: '::view-transition-new(root)'
    });
  }).catch(() => { /* The theme update also works if a snapshot is skipped. */ });

  transition.finished.finally(() => {
    accent.remove();
    themeChanging = false;
  });
}
