export function initMenu ({
  dropdownToggle,
  dropdownItem,
  navbarMenu,
  topLevelLinks
}) {
  const toggles = document.querySelectorAll(dropdownToggle);
  const navbar = document.querySelector(navbarMenu);
  const items = () => document.querySelectorAll(dropdownItem); // aktuální kolekce

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = toggle.parentElement;
      items().forEach((item) => {
        if (item !== parent) item.classList.remove('show');
      });
      parent.classList.toggle('show');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest(navbarMenu)) {
      items().forEach((item) => item.classList.remove('show'));
    }
  });

  document.querySelectorAll(topLevelLinks).forEach((link) => {
    link.addEventListener('click', function () {
      document.querySelectorAll(`${topLevelLinks}.active`).forEach((a) => a.classList.remove('active'));
      this.classList.add('active');
    });
  });
}
