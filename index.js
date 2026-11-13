/* -----------------------------------------
  Have focus outline only for keyboard users 
 ---------------------------------------- */

const handleFirstTab = (e) => {
  if(e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing')

    window.removeEventListener('keydown', handleFirstTab)
    window.addEventListener('mousedown', handleMouseDownOnce)
  }

}

const handleMouseDownOnce = () => {
  document.body.classList.remove('user-is-tabbing')

  window.removeEventListener('mousedown', handleMouseDownOnce)
  window.addEventListener('keydown', handleFirstTab)
}

window.addEventListener('keydown', handleFirstTab)

const backToTopButton = document.querySelector(".back-to-top");

window.addEventListener("scroll", () => {
  backToTopButton.classList.toggle("visible", window.scrollY > 700);
});

// Dynamic copyright year
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll reveal animations
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = window.IntersectionObserver && new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(el => revealObserver ? revealObserver.observe(el) : el.classList.add('revealed'));

// GIF lightbox with prev/next navigation
const lightbox = document.getElementById('gif-lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

let gifItems = [];   // { src, alt, caption }

// Collect all GIF cards for navigation
function collectGifItems() {
  gifItems = [];
  document.querySelectorAll('.work__gif-card').forEach(card => {
    const img = card.querySelector('.work__gif');
    const caption = card.querySelector('.work__gif-overlay__caption');
    if (img) {
      gifItems.push({
        src: img.src,
        alt: img.alt || '',
        caption: caption ? caption.textContent : ''
      });
    }
  });
}
collectGifItems();

let currentIndex = 0;
let lightboxTrigger;
const galleryCards = document.querySelectorAll('.work__gif-card');
let lightboxAnimation;

// Motion Prompt #162 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#162
function animateLightbox(closing) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const source = (galleryCards[currentIndex] || lightboxTrigger).getBoundingClientRect();
  const image = lightboxImg.getBoundingClientRect();
  if (!image.width || !image.height || !source.width || !source.height) return null;

  const thumbnail = {
    transform: `translate(${source.left - image.left}px, ${source.top - image.top}px)
      scale(${source.width / image.width}, ${source.height / image.height})`
  };
  const full = { transform: 'none' };
  const timing = {
    duration: closing ? 350 : 450,
    easing: closing ? 'cubic-bezier(.645,.045,.355,1)' : 'cubic-bezier(.215,.61,.355,1)',
    fill: 'both'
  };
  lightbox.animate([{ opacity: 0 }, { opacity: 1 }], {
    ...timing, direction: closing ? 'reverse' : 'normal', pseudoElement: '::backdrop'
  });
  return lightboxImg.animate(closing ? [full, thumbnail] : [thumbnail, full], timing);
}

function closeLightbox() {
  if (lightbox.dataset.closing) return;
  lightboxAnimation?.cancel();
  const animation = animateLightbox(true);
  if (!animation) {
    lightbox.close();
    return;
  }
  lightbox.dataset.closing = 'true';
  animation.finished.then(() => lightbox.close(), () => lightbox.close());
}

function showLightbox(item, trigger) {
  lightboxImg.src = item.src;
  lightboxImg.alt = item.alt;
  lightboxCaption.textContent = item.caption;
  if (lightbox.open) return;
  lightboxTrigger = trigger;
  lightboxPrev.hidden = lightboxNext.hidden = currentIndex < 0;
  lightbox.showModal();
  lightboxAnimation = animateLightbox(false);
}

function stepLightbox(direction) {
  if (currentIndex < 0) return;
  currentIndex = (currentIndex + direction + gifItems.length) % gifItems.length;
  showLightbox(gifItems[currentIndex]);
}

galleryCards.forEach((card, index) => {
  card.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    collectGifItems();
    currentIndex = index;
    showLightbox(gifItems[index], card);
  });
});

const mainImage = document.getElementById('project1-main');
const imageTrigger = mainImage.closest('button');
imageTrigger.addEventListener('click', () => {
  currentIndex = -1;
  showLightbox({ src: mainImage.src, alt: mainImage.alt, caption: '' }, imageTrigger);
});

document.querySelectorAll('.work__thumb').forEach(thumb => {
  thumb.addEventListener('click', () => {
    const image = thumb.querySelector('img');
    mainImage.src = image.src;
    mainImage.alt = image.alt;
    thumb.parentElement.querySelectorAll('.work__thumb').forEach(button => {
      button.classList.toggle('active', button === thumb);
      button.setAttribute('aria-pressed', String(button === thumb));
    });
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('cancel', event => {
  event.preventDefault();
  closeLightbox();
});
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox();
});
lightbox.addEventListener('close', () => {
  delete lightbox.dataset.closing;
  lightbox.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
  lightboxImg.removeAttribute('src');
  lightboxTrigger?.focus({ preventScroll: true });
});
lightboxPrev.addEventListener('click', () => stepLightbox(-1));
lightboxNext.addEventListener('click', () => stepLightbox(1));
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') stepLightbox(1);
  if (event.key === 'ArrowLeft') stepLightbox(-1);
});

// Theme toggle
(function() {
  const themeSwitch = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function setThemeUI(theme) {
    themeSwitch.classList.toggle('light', theme === 'light');
    themeSwitch.setAttribute('aria-pressed', String(theme === 'dark'));
    themeSwitch.querySelectorAll('.theme-switch__option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === theme);
    });
  }

  // Init UI
  setThemeUI(html.getAttribute('data-theme') || 'light');

  themeSwitch.addEventListener('click', () => {
    if (themeChanging) return;
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    changeTheme(next, () => {
      html.setAttribute('data-theme', next);
      setThemeUI(next);
      localStorage.setItem('theme', next);
    });
  });
})();

// Copy email to clipboard
document.getElementById('copy-email').addEventListener('click', () => {
  const email = 'chen121760@qq.com';
  const tooltip = document.querySelector('.btn-copy__tooltip');
  navigator.clipboard.writeText(email).then(() => {
    const lang = document.documentElement.getAttribute('lang') || 'en';
    tooltip.textContent = lang === 'zh' ? '已复制' : 'Copied!';
    tooltip.classList.add('show');
    setTimeout(() => {
      tooltip.classList.remove('show');
      tooltip.textContent = lang === 'zh' ? '复制' : 'Copy';
    }, 1500);
  });
});
