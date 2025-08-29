import { initLightbox } from './photo-gallery.js';
import { initHeaderScroll } from './header.js';
import { initCarousel } from './references.js';
import { initMenu } from './menu.js';
import { initContactForm } from './contact.js';
import { initFAQ } from './faq.js';
import { initFBChat } from './fb-chat.js';
import { initDevLogin } from './dev-login.js';

// Kdyby se něco inicializovalo dřív než DOM
// document.addEventListener('DOMContentLoaded', () => { /* init */ });

document.addEventListener('DOMContentLoaded', () => {
  // Header při scrollu
  initHeaderScroll({ header: 'header', trigger: 10 });

  // Reference carousel
  initCarousel({
    track: '.carousel-track',
    card: '.reference-card',
    prevBtn: '#prev',
    nextBtn: '#next',
    gapPx: 32,
    breakpoints: [
      { max: 768, perSlide: 1 },
      { max: 1024, perSlide: 2 },
      { max: Infinity, perSlide: 3 }
    ],
    autoMs: 20000
  });

  // Menu + dropdowny
  initMenu({
    dropdownToggle: '.dropdown-toggle',
    dropdownItem: '.has-dropdown',
    navbarMenu: '.navbar-menu',
    topLevelLinks: '.navbar-menu > ul > li > a'
  });

  // Kontakt (fake submit)
  initContactForm({ form: '.contact-form' });

  // FAQ akordeon
  initFAQ({ question: '.faq-q', openClass: 'open' });

  // Facebook chat
  initFBChat({
    pageId: '612589358612782',
    locale: 'cs_CZ',
    version: 'v19.0'
  });

  // Vývojový login gate
  initDevLogin({
    needPass: true,              // přepni na true, pokud chceš vyžadovat login
    user: 'admin',
    pass: 'tajneheslo',
    loginBox: '#loginBox',
    secretContent: '#secretContent',
    form: '#loginForm',
    userInput: '#username',
    passInput: '#password',
    errorMsg: '#errorMsg'
  });

  // Lightbox / galerie
  initLightbox({
    lightbox: '#lightbox',
    stageImage: '#stageImage',
    thumbs: '#thumbs',
    closeBtn: '#closeBtn',
    // mapa: tlačítko -> galerie
    galleries: {
      '#open-gallery-oboci': '#gallery-oboci',
      '#open-gallery-ocni-linky': '#gallery-ocni-linky',
      '#open-gallery-rty': '#gallery-rty'
    }
  });

});
