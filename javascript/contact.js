export function initContactForm ({ form }) {
  const el = document.querySelector(form);
  if (!el) return;
  el.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Děkujeme za zprávu! Brzy se vám ozveme.');
    el.reset();
  });
}
