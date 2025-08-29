export function initCarousel ({
  track: trackSel,
  card: cardSel,
  prevBtn: prevSel,
  nextBtn: nextSel,
  gapPx = 32,
  breakpoints = [
    { max: 768, perSlide: 1 },
    { max: 1024, perSlide: 2 },
    { max: Infinity, perSlide: 3 }
  ],
  autoMs = 20000
}) {
  const track = document.querySelector(trackSel);
  const cards = Array.from(document.querySelectorAll(cardSel));
  const prevBtn = document.querySelector(prevSel);
  const nextBtn = document.querySelector(nextSel);
  if (!track || cards.length === 0 || !prevBtn || !nextBtn) return;

  function getCardsPerSlide () {
    const w = window.innerWidth;
    for (const bp of breakpoints) {
      if (w < bp.max) return bp.perSlide;
    }
    return 1;
  }

  let cardsPerSlide = getCardsPerSlide();
  let currentSlide = 0;

  function getMaxSlide () {
    return Math.ceil(cards.length / cardsPerSlide) - 1;
  }

  function updateCarousel () {
    const cardWidth = cards[0].offsetWidth;
    const totalOffset = currentSlide * (cardWidth + gapPx) * cardsPerSlide;
    track.style.transform = `translateX(-${totalOffset}px)`;
  }

  nextBtn.addEventListener('click', () => {
    const maxSlide = getMaxSlide();
    currentSlide = currentSlide < maxSlide ? currentSlide + 1 : 0;
    updateCarousel();
  });

  prevBtn.addEventListener('click', () => {
    const maxSlide = getMaxSlide();
    currentSlide = currentSlide > 0 ? currentSlide - 1 : maxSlide;
    updateCarousel();
  });

  const auto = setInterval(() => nextBtn.click(), autoMs);

  window.addEventListener('resize', () => {
    const newCardsPerSlide = getCardsPerSlide();
    if (newCardsPerSlide !== cardsPerSlide) {
      cardsPerSlide = newCardsPerSlide;
      currentSlide = 0;
      updateCarousel();
    }
  });

  updateCarousel();

  // volitelně vrátíme cleanup, kdybys to někdy unmountoval
  return () => clearInterval(auto);
}
