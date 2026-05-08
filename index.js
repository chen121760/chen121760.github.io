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

// Copy email to clipboard
document.getElementById('copy-email').addEventListener('click', () => {
  const email = '2285450581@qq.com';
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
