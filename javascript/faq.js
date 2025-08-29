export function initFAQ ({ question, openClass = 'open' }) {
  document.querySelectorAll(question).forEach((q) => {
    q.addEventListener('click', function () {
      this.parentElement.classList.toggle(openClass);
    });
  });
}