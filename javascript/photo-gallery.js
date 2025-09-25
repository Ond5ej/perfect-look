export function initLightbox (sel) {
  const lightbox = document.querySelector(sel.lightbox);
  const stageImage = document.querySelector(sel.stageImage);
  const thumbs = document.querySelector(sel.thumbs);
  const closeBtn = document.querySelector(sel.closeBtn);
  const stageText = document.querySelector('.stage-text');

  if (!lightbox || !stageImage || !thumbs || !closeBtn) {
    console.warn('Nenalezeny prvky:', { lightbox, stageImage, thumbs, closeBtn });
    return;
  }

  // připrav mapu {buttonEl -> galleryEl}
  const pairs = Object.entries(sel.galleries).map(([btnSel, galSel]) => {
    const btn = document.querySelector(btnSel);
    const gal = document.querySelector(galSel);
    return btn && gal ? { btn, gal } : null;
  }).filter(Boolean);


  console.log('Spárovaných triggerů:', pairs.length);

  if (!pairs.length) return;

  let images = [];
  let current = 0;

  function srcFor (i) {
    const el = images[i];
    return el.dataset.large || el.src;
  }

  function markActive (i) {
    Array.from(thumbs.children).forEach((node, idx) => {
      node.classList.toggle('is-active', idx === i);
    });
  }

  function show (i) {
    if (!images.length) return;
    current = Math.max(0, Math.min(i, images.length - 1));
    stageImage.src = srcFor(current);
    stageImage.alt = images[current].alt || 'Fotografie';
    // tady přidáme popisek
    stageText.textContent = images[current].dataset.text || '';
    markActive(current);
  }

  function buildThumbsFromGallery (galleryEl) {
    thumbs.innerHTML = '';
    images = Array.from(galleryEl.querySelectorAll('img'));
    images.forEach((img, index) => {
      const t = img.cloneNode();
      t.removeAttribute('data-large');
      t.addEventListener('click', () => show(index));
      thumbs.appendChild(t);
    });
  }

  function openLightboxFor (galleryEl, startIndex = 0) {
    buildThumbsFromGallery(galleryEl);
    document.body.style.overflow = 'hidden';
    lightbox.setAttribute('aria-hidden', 'false');
    show(startIndex);
  }

  function closeLightbox () {
    document.body.style.overflow = '';
    lightbox.setAttribute('aria-hidden', 'true');
    stageImage.removeAttribute('src');
  }

  function wireTrigger (triggerEl, galleryEl) {
    // accessibility: udělej z figure „button-like“ prvek
    triggerEl.setAttribute('role', 'button');
    triggerEl.setAttribute('tabindex', '0');

    const open = () => openLightboxFor(galleryEl, 0);

    triggerEl.addEventListener('click', open);
    triggerEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  }

  pairs.forEach(({ btn, gal }) => {
    wireTrigger(btn, gal); // btn je teď tvoje <figure>
  });
  closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (lightbox.getAttribute('aria-hidden') === 'true') return;
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'Escape') closeLightbox();
  });

}
