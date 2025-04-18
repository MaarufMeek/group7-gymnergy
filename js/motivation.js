const track = document.querySelector('.carousel-track');
  const cards = document.querySelectorAll('.quote-card');
  const prev = document.getElementById('prevQuote');
  const next = document.getElementById('nextQuote');

  let currentIndex = 0;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  prev.addEventListener('click', () => {
    currentIndex = (currentIndex === 0) ? cards.length - 1 : currentIndex - 1;
    updateCarousel();
  });

  next.addEventListener('click', () => {
    currentIndex = (currentIndex === cards.length - 1) ? 0 : currentIndex + 1;
    updateCarousel();
  });