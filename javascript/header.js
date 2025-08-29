export function initHeaderScroll ({ header: headerSel = 'header', trigger = 10 } = {}) {
  const header = document.querySelector(headerSel);
  if (!header) return;

  const SCROLL_TRIGGER = trigger;

  function updateHeaderOnScroll () {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_TRIGGER);
  }

  updateHeaderOnScroll();
  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });

}
