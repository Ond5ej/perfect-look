export function initMenu ({
  dropdownToggle,
  dropdownItem,
  navbarMenu,
  topLevelLinks,             // může zůstat pro CSS, JS ho tu nepotřebuje
  headerSelector = 'header',
  hamburgerToggle = '.navbar-toggle'  // NOVÉ
}) {
  const menuEl = document.querySelector(navbarMenu);
  const toggleBtn = document.querySelector(hamburgerToggle);
  const headerEl = document.querySelector(headerSelector);

  if (!menuEl) {
    console.warn('[menu] Nenalezen prvek menu:', navbarMenu);
    return;
  }

  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

  // --- Header dekor (is-scrolled) ---
  const setScrolled = () => {
    if (!headerEl) return;
    if (window.scrollY > 6) headerEl.classList.add('is-scrolled');
    else headerEl.classList.remove('is-scrolled');
  };
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  // --- Dropdowny ---
  const toggles = document.querySelectorAll(dropdownToggle);
  const items = () => document.querySelectorAll(dropdownItem);

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const li = toggle.closest(dropdownItem);
      if (!li) return;

      if (isMobile()) {
        // Na mobilu používáme .open (viz CSS)
        items().forEach((it) => { if (it !== li) it.classList.remove('open'); });
        li.classList.toggle('open');
      } else {
        // Na desktopu zůstává .show (hover/click)
        items().forEach((it) => { if (it !== li) it.classList.remove('show'); });
        li.classList.toggle('show');
      }
    });
  });

  // --- Scroll-spy (z tvého kódu) ---
  const navLinks = [...document.querySelectorAll(`${navbarMenu} a[href^="#"]`)];
  const idFromHref = (a) => decodeURIComponent(a.getAttribute('href') || '').replace(/^#/, '');
  const targetFromLink = (a) => document.getElementById(idFromHref(a));
  const sections = navLinks.map(targetFromLink).filter(Boolean);
  if (sections.length === 0) {
    console.warn('[menu] Nenašel jsem žádné sekce z odkazů menu.');
  }

  let headerOffset = headerEl ? headerEl.offsetHeight : 0;
  const updateHeaderOffset = () => { headerOffset = headerEl ? headerEl.offsetHeight : 0; };
  window.addEventListener('resize', updateHeaderOffset);
  if ('ResizeObserver' in window && headerEl) {
    new ResizeObserver(updateHeaderOffset).observe(headerEl);
  }

  const setActive = (id) => {
    navLinks.forEach(a => a.classList.remove('active'));
    const directLink = navLinks.find(a => idFromHref(a) === id);
    if (directLink) directLink.classList.add('active');
    const sluzbySections = ['permanentni-make-up', 'oboci', 'ocni-linky', 'rty', 'kosmetika'];
    if (sluzbySections.includes(id)) {
      const sluzbyLink = navLinks.find(a => idFromHref(a) === 'sluzby');
      if (sluzbyLink) sluzbyLink.classList.add('active');
    }
  };

  // Hladké scrollování + zavření menu na mobilu
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const id = idFromHref(link);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      history.pushState(null, '', `#${id}`);
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      setActive(id);
      items().forEach((it) => { it.classList.remove('show'); it.classList.remove('open'); });
      if (isMobile()) setExpanded(false);
    });
  });

  const applyHash = () => {
    const id = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
    if (id && document.getElementById(id)) setActive(id);
  };
  window.addEventListener('hashchange', applyHash);
  applyHash();

  // IntersectionObserver (s tvými parametry)
  const runObserver = () => {
    if (!('IntersectionObserver' in window) || sections.length === 0) return false;

    const observer = new IntersectionObserver((entries) => {
      let best = null;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
      if (best) setActive(best.target.id);
    }, {
      root: null,
      rootMargin: `${-(headerOffset + 8)}px 0px -40% 0px`,
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    sections.forEach(sec => observer.observe(sec));
    return true;
  };

  const ok = runObserver();
  if (!ok) {
    const onScroll = () => {
      const middle = window.scrollY + headerOffset + window.innerHeight * 0.3;
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

  // ==========================
  // HAMBURGER LOGIKA
  // ==========================
  const setExpanded = (open) => {
    menuEl.classList.toggle('open', open);
    if (toggleBtn) {
      toggleBtn.classList.toggle('active', open);
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    document.body.classList.toggle('menu-open', open);
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      setExpanded(!menuEl.classList.contains('open'));
    });
  }

  // Klik mimo menu zavře (na mobilu i hamburger)
  document.addEventListener('click', (e) => {
    if (!e.target.closest(navbarMenu) && !e.target.closest(hamburgerToggle)) {
      items().forEach((it) => { it.classList.remove('show'); it.classList.remove('open'); });
      if (isMobile()) setExpanded(false);
    }
  });

  // ESC zavře
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      items().forEach((it) => { it.classList.remove('show'); it.classList.remove('open'); });
      setExpanded(false);
    }
  });

  // Při resize nad breakpoint reset stavu
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      setExpanded(false);
      items().forEach((it) => it.classList.remove('open'));
    }
  });
}
