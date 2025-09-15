export function initMenu ({
  dropdownToggle,
  dropdownItem,
  navbarMenu,
  topLevelLinks,      // může zůstat pro tvoje CSS, v JS ho teď nepotřebujeme
  headerSelector = 'header'
}) {
  // --- Dropdowny ---
  const toggles = document.querySelectorAll(dropdownToggle);
  const items = () => document.querySelectorAll(dropdownItem);

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = toggle.closest(dropdownItem);
      items().forEach((it) => { if (it !== parent) it.classList.remove('show'); });
      parent?.classList.toggle('show');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest(navbarMenu)) items().forEach((it) => it.classList.remove('show'));
  });

  // --- Scroll-spy ---
  const navLinks = [...document.querySelectorAll(`${navbarMenu} a[href^="#"]`)];
  const idFromHref = (a) => decodeURIComponent(a.getAttribute('href') || '').replace(/^#/, '');
  const targetFromLink = (a) => document.getElementById(idFromHref(a));

  const sections = navLinks.map(targetFromLink).filter(Boolean);
  if (sections.length === 0) {
    console.warn('[menu] Nenašel jsem žádné sekce z odkazů menu – zkontroluj, že každé href="#id" má na stránce element s id="id".');
  }

  // zjišťování výšky headeru (sticky)
  const headerEl = document.querySelector(headerSelector);
  let headerOffset = headerEl ? headerEl.offsetHeight : 0;

  // kdyby se header měnil (responsive), přepočítej
  const updateHeaderOffset = () => { headerOffset = headerEl ? headerEl.offsetHeight : 0; };
  window.addEventListener('resize', updateHeaderOffset);
  // pokud podporováno, sleduj změny velikosti headeru
  if ('ResizeObserver' in window && headerEl) {
    const ro = new ResizeObserver(updateHeaderOffset);
    ro.observe(headerEl);
  }

  const setActive = (id) => {
    navLinks.forEach(a => a.classList.remove('active'));

    // klasické zvýraznění
    const directLink = navLinks.find(a => idFromHref(a) === id);
    if (directLink) directLink.classList.add('active');

    // pokud jsme v podsekci SLUŽEB → zvýrazni i hlavní "SLUŽBY"
    const sluzbySections = ['permanentni-make-up', 'oboci', 'ocni-linky', 'rty', 'kosmetika'];
    if (sluzbySections.includes(id)) {
      const sluzbyLink = navLinks.find(a => idFromHref(a) === 'sluzby');
      if (sluzbyLink) sluzbyLink.classList.add('active');
    }
  };

  // Hladké scrollování + okamžitá vizuální odezva
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const id = idFromHref(link);
      const target = document.getElementById(id);
      if (!target) return; // nech default (např. externí)
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      history.pushState(null, '', `#${id}`);
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      setActive(id);
      items().forEach((it) => it.classList.remove('show'));
    });
  });

  // Aktivace podle hash (načtení / zpět/vpřed)
  const applyHash = () => {
    const id = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
    if (id && document.getElementById(id)) setActive(id);
  };
  window.addEventListener('hashchange', applyHash);
  applyHash();

  // --- IntersectionObserver s bezpečnými parametry ---
  const runObserver = () => {
    if (!('IntersectionObserver' in window) || sections.length === 0) return false;

    const observer = new IntersectionObserver((entries) => {
      // vyber sekci s největším průnikem
      let best = null;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
      if (best) {
        // console.debug('[menu] active:', best.target.id, 'ratio:', best.intersectionRatio);
        setActive(best.target.id);
      }
    }, {
      root: null,
      // mírnější okno: odečti header nahoře a nech 40% dole
      rootMargin: `${-(headerOffset + 8)}px 0px -40% 0px`,
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    sections.forEach(sec => observer.observe(sec));
    return true;
  };

  const ok = runObserver();
  if (!ok) {
    // Fallback: klasický scroll výpočet
    const onScroll = () => {
      const middle = window.scrollY + headerOffset + window.innerHeight * 0.3; // „měřící“ linie ~ 30% pod headerem
      let current = null;
      for (const sec of sections) {
        const top = sec.offsetTop;
        const bottom = top + sec.offsetHeight;
        if (middle >= top && middle < bottom) { current = sec; break; }
      }
      if (current) setActive(current.id);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}
