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

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      const li = toggle.closest(dropdownItem);
      if (!li) return;

      if (isOffcanvas()) {
        // v off-canvas režimu dropdowny nespínáme (necháváme rozbalené)
        e.preventDefault();
        return;
      }

      // DESKTOP chování
      e.preventDefault();
      items().forEach((it) => { if (it !== li) it.classList.remove('show'); });
      li.classList.toggle('show');

      const open = li.classList.contains('show');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // --- Zavřít dropdown při kliku mimo (DESKTOP)
  document.addEventListener('click', (e) => {
    if (isOffcanvas()) return; // jen na desktopu
    const clickedInsideDropdown = e.target.closest(dropdownItem);
    if (!clickedInsideDropdown) {
      items().forEach((li) => li.classList.remove('show'));
      document.querySelectorAll(dropdownToggle).forEach(tgl => tgl.setAttribute('aria-expanded', 'false'));
    }
  });

  // --- Zavřít dropdown na Escape (DESKTOP)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !isOffcanvas()) {
      items().forEach((li) => li.classList.remove('show'));
      document.querySelectorAll(dropdownToggle).forEach(tgl => tgl.setAttribute('aria-expanded', 'false'));
    }
  });

  // --- Scroll-spy (METODA A: pouze fallback + top guard) ---
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

    // "SLUŽBY" jako parent aktivní, když jsme v některé z jeho sekcí
    const sluzbySections = ['sluzby', 'permanentni-make-up', 'oboci', 'ocni-linky', 'rty', 'kosmetika'];
    if (sluzbySections.includes(id)) {
      const sluzbyLink = navLinks.find(a => idFromHref(a) === 'sluzby');
      if (sluzbyLink) sluzbyLink.classList.add('active');
    }
  };

  // potlačení přepisu během smooth scrollu
  let suppressSpyUntil = 0;
  const setActiveSafely = (id) => {
    if (Date.now() < suppressSpyUntil) return;
    setActive(id);
  };

  // možnost zavřít mobilní panel z „venku“
  let setExpandedGlobal = null;

  // Hladké scrollování + zavření panelu na mobilu
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const id = idFromHref(link);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();

      const y = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      history.pushState(null, '', `#${id}`);

      suppressSpyUntil = Date.now() + 600; // 0.6 s
      setActive(id); // okamžitá vizuální odezva

      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });

      if (isMobile() && typeof setExpandedGlobal === 'function') {
        setExpandedGlobal(false);
      }
    });
  });

  const HOME_ID = 'uvod';
  const TOP_THRESHOLD = 16; // px

  const onScroll = () => {
    // 1) úplný vršek stránky → vždy ÚVOD
    if (window.scrollY <= TOP_THRESHOLD) {
      setActiveSafely(HOME_ID);
      return;
    }

    // 2) standardní výběr sekce poblíž středu viewportu
    const middle = window.scrollY + headerOffset + window.innerHeight * 0.3;
    let current = null;
    for (const sec of sections) {
      const top = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      if (middle >= top && middle < bottom) { current = sec; break; }
    }
    if (current) setActiveSafely(current.id);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // hash při načtení / změně
  const applyHash = () => {
    const id = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
    if (id && document.getElementById(id)) setActive(id);
    else if (window.scrollY <= TOP_THRESHOLD) setActive(HOME_ID);
  };
  window.addEventListener('hashchange', applyHash);
  applyHash();

  // ==========================
  // HAMBURGER LOGIKA (pro mobilní/off-canvas menu)
  // ==========================
  const isMobileNavElement = menuEl.classList.contains('nav-mobile') || menuEl.id === 'mobile-menu';

  if (isMobileNavElement) {
    const updateMenuAria = (open) => {
      menuEl.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    // -------- AUTO-CLOSE: nastavení --------
    const AUTO_CLOSE_MS = 3000;      // po kolika ms se panel zavře (změň podle potřeby)
    let autoCloseTimer = null;       // id timeoutu

    const stopAutoClose = () => {    // zruš běžící časovač
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    };

    const restartAutoClose = () => { // spusť/obnov časovač, jen v off-canvas režimu
      stopAutoClose();
      if (!isOffcanvas()) return;    // na desktopu časovač nechceme
      autoCloseTimer = setTimeout(() => setExpanded(false), AUTO_CLOSE_MS);
    };
    // --------------------------------------

    const setExpanded = (open) => {
      menuEl.classList.toggle('open', open);
      if (toggleBtn) toggleBtn.classList.toggle('active', open);
      document.body.classList.toggle('menu-open', open);
      updateMenuAria(open);

      // AUTO-CLOSE: při otevření spustit/obnovit, při zavření zrušit
      if (open) restartAutoClose();
      else stopAutoClose();
    };

    // zpřístupníme zavírání i z horní části skriptu
    setExpandedGlobal = setExpanded;

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        setExpanded(!menuEl.classList.contains('open'));
      });
    }

    // klik mimo menu → zavřít (jen v off-canvas režimu)
    document.addEventListener('click', (e) => {
      const clickInMenuOrToggle = e.target.closest(navbarMenu) || e.target.closest(hamburgerToggle);
      if (!clickInMenuOrToggle && isOffcanvas()) setExpanded(false);
    });

    // ESC → zavřít panel
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setExpanded(false);
    });


    // AUTO-CLOSE: interakce v panelu = „uživatel je aktivní“ → restart časovače
    ['click', 'touchstart', 'keydown'].forEach(evt => {
      menuEl.addEventListener(evt, restartAutoClose, { passive: true });
    });

    // AUTO-CLOSE: klik na libovolný odkaz v mobilním menu → zavřít hned
    /*
    menuEl.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => setExpanded(false));
    });
    */
    menuEl.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      // volitelně vynech dropdown toggly:
      if (a.classList.contains('dropdown-toggle')) return;
      setExpanded(false);
    });


    // AUTO-CLOSE: backdrop (pokud existuje) → zavřít
    const backdrop = document.querySelector('.menu-backdrop');
    backdrop?.addEventListener('click', () => setExpanded(false));

    // při přechodu z off-canvas na desktop panel zavřít + zastavit časovač
    let wasOffcanvas = isOffcanvas();
    window.addEventListener('resize', () => {
      const nowOffcanvas = isOffcanvas();
      if (!nowOffcanvas && wasOffcanvas) {
        stopAutoClose();
        setExpanded(false);
      } else if (nowOffcanvas && menuEl.classList.contains('open')) {
        // zůstáváme v off-canvas a panel je otevřený → znovu nastartuj timer
        restartAutoClose();
      }
      wasOffcanvas = nowOffcanvas;
      updateHeaderOffset(); // aktualizuj výšku headeru pro scroll-spy
    });
  }
}
