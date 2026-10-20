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
  // Keep native image viewing available when this script is disabled.
  document.querySelectorAll('.project-gallery .work__gif-card').forEach(link => {
    link.addEventListener('click', event => event.preventDefault());
  });
})();
