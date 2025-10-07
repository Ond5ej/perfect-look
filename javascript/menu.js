export function initMenu ({
  dropdownToggle,
  dropdownItem,
  navbarMenu,
  topLevelLinks,             // může zůstat pro CSS, JS ho tu nepotřebuje
  headerSelector = 'header',
  hamburgerToggle = '.navbar-toggle'
}) {
  const menuEl = document.querySelector(navbarMenu);
  const toggleBtn = document.querySelector(hamburgerToggle);
  const headerEl = document.querySelector(headerSelector);

  if (!menuEl) {
    console.warn('[menu] Nenalezen prvek menu:', navbarMenu);
    return;
  }

  // breakpointy v CSS:
  // - mobilní panel pod 768px
  // - off-canvas (mobil+tablet) do 1024px
  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
  const isOffcanvas = () => window.matchMedia('(max-width: 1024px)').matches;

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

  // pomocné: hromadné otevření/zavření dropdownů (pouze pro off-canvas)
  const expandAllDropdowns = (open) => {
    const all = items(); // všechny .has-dropdown
    const services = document.getElementById('menu-sluzby');

    all.forEach((li) => {
      const isServices = li === services;
      li.classList.toggle('open', open ? isServices : false);

      const tgl = li.querySelector(dropdownToggle);
      if (tgl) tgl.setAttribute('aria-expanded', open && isServices ? 'true' : 'false');
    });

    // Volitelně: pokud chceš mít rovnou rozbalenou i první sekci uvnitř SLUŽEB,
    // přidej třídu 'open' i na první vnořený li:
    if (open && services) {
      const innerFirst = services.querySelector('.dropdown > li');
      if (innerFirst) innerFirst.classList.add('open'); // jen když máš pro vnořené úrovně stejné pravidlo .open
    }
  };
  // původní click toggle — ale na off-canvas REŽIMU ho deaktivujeme (necháme otevřené)
  toggles.forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      const li = toggle.closest(dropdownItem);
      if (!li) return;

      if (isOffcanvas()) {
        // v off-canvas režimu dropdowny vždy otevřené → nic nepřepínej
        e.preventDefault();
        return;
      }

      // DESKTOP chování beze změn
      e.preventDefault();
      items().forEach((it) => { if (it !== li) it.classList.remove('show'); });
      li.classList.toggle('show');

      const open = li.classList.contains('show');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // --- Scroll-spy ---
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
    const sluzbySections = ['sluzby', 'permanentni-make-up', 'oboci', 'ocni-linky', 'rty', 'kosmetika'];
    if (sluzbySections.includes(id)) {
      const sluzbyLink = navLinks.find(a => idFromHref(a) === 'sluzby');
      if (sluzbyLink) sluzbyLink.classList.add('active');
    }
  };

  // Hladké scrollování + zavření panelu na mobilu
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
      if (isMobile()) setExpanded(false);
    });
  });

  const applyHash = () => {
    const id = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
    if (id && document.getElementById(id)) setActive(id);
  };
  window.addEventListener('hashchange', applyHash);
  applyHash();

  // IntersectionObserver
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
  // jen pokud je menuEl = mobilní menu (#mobile-menu / .nav-mobile)
  const isMobileNavElement = menuEl.classList.contains('nav-mobile') || menuEl.id === 'mobile-menu';

  if (isMobileNavElement) {
    const updateMenuAria = (open) => {
      menuEl.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    const setExpanded = (open) => {
      menuEl.classList.toggle('open', open);
      if (toggleBtn) toggleBtn.classList.toggle('active', open);
      document.body.classList.toggle('menu-open', open);
      updateMenuAria(open);
    };

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        setExpanded(!menuEl.classList.contains('open'));
      });
    }

    document.addEventListener('click', (e) => {
      const clickInMenuOrToggle = e.target.closest(navbarMenu) || e.target.closest(hamburgerToggle);
      if (!clickInMenuOrToggle && isOffcanvas()) setExpanded(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setExpanded(false);
    });

    let wasOffcanvas = isOffcanvas();
    window.addEventListener('resize', () => {
      const nowOffcanvas = isOffcanvas();
      if (!nowOffcanvas && wasOffcanvas) {
        setExpanded(false);
      }
      wasOffcanvas = nowOffcanvas;
      updateHeaderOffset();
    });
  }
}
