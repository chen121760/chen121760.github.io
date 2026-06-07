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
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(el => revealObserver.observe(el));

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

function openLightboxAt(index) {
  currentIndex = index;
  const item = gifItems[index];
  if (!item) return;
  lightboxImg.src = item.src;
  lightboxImg.alt = item.alt;
  lightboxCaption.textContent = item.caption;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function lightboxNextImage() {
  if (gifItems.length === 0) return;
  openLightboxAt((currentIndex + 1) % gifItems.length);
}

function lightboxPrevImage() {
  if (gifItems.length === 0) return;
  openLightboxAt((currentIndex - 1 + gifItems.length) % gifItems.length);
}

// Click / keyboard on a GIF card opens lightbox at that index
document.querySelectorAll('.work__gif-card').forEach((card, i) => {
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    collectGifItems(); // refresh in case i18n changed captions
    openLightboxAt(i);
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      collectGifItems();
      openLightboxAt(i);
    }
  });
});

// Open lightbox on main project image click
document.querySelectorAll('.work__image--main').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

// Thumbnail switcher
document.querySelectorAll('.work__thumb').forEach(thumb => {
  thumb.addEventListener('click', () => {
    const main = document.querySelector(thumb.dataset.main);
    if (main) {
      main.src = thumb.src;
      thumb.parentElement.querySelectorAll('.work__thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    }
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lightboxImg.src = '';
  lightboxCaption.textContent = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', closeLightbox);
lightboxImg.addEventListener('click', (e) => e.stopPropagation());
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); lightboxPrevImage(); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); lightboxNextImage(); });

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') {
    closeLightbox();
  } else if (e.key === 'ArrowRight') {
    lightboxNextImage();
  } else if (e.key === 'ArrowLeft') {
    lightboxPrevImage();
  }
});

// Theme toggle
(function() {
  const themeSwitch = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function setThemeUI(theme) {
    themeSwitch.classList.toggle('light', theme === 'light');
    themeSwitch.querySelectorAll('.theme-switch__option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === theme);
    });
  }

  // Init UI
  setThemeUI(html.getAttribute('data-theme') || 'dark');

  themeSwitch.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setThemeUI(next);
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
