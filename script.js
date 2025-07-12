// Seletores dos elementos do coração e navbar
const heartLeft = document.getElementById('heart-left');
const heartRight = document.getElementById('heart-right');
const heartContainer = document.querySelector('.heart-container');
const navbarHeart = document.getElementById('navbar-heart');
const parallaxSection = document.getElementById('parallax-heart');
// Objeto de legendas para as fotos
const captions = {
  1: "Dia do primeiro Beijo + Dogão"
};

// Parâmetros de rolagem
const joinScroll = 120; // px para unir o coração
// const unlockScroll = 250; // REMOVIDO: não há mais limite extra
const moveToNavbarScroll = 350; // px para mover para navbar

let scrollLocked = false;
let virtualScroll = 0;
let lastTouchY = null;
let waitingForTransition = false;

function animateHeart(progress) {
  const maxOffset = 60;
  const leftX = -maxOffset + maxOffset * progress;
  const rightX = maxOffset - maxOffset * progress;
  heartLeft.style.transform = `translateX(${leftX}px) rotate(-45deg)`;
  heartRight.style.transform = `translateX(${rightX}px) rotate(45deg)`;
}

function handleParallaxHeart() {
  let progress;
  if (scrollLocked) {
    // Usar o scroll virtual
    progress = Math.min(virtualScroll / joinScroll, 1);
    animateHeart(progress);
    if (virtualScroll >= joinScroll && !waitingForTransition) {
      // Espera a animação terminar antes de liberar o scroll
      waitingForTransition = true;
      animateHeart(1);
      heartRight.addEventListener('transitionend', onHeartTransitionEnd);
    }
  } else {
    // Usar o scroll real
    const scrollY = window.scrollY;
    if (scrollY < joinScroll) {
      progress = Math.min(scrollY / joinScroll, 1);
      animateHeart(progress);
      // Se o usuário voltar para o topo, trava novamente
      if (scrollY <= 0) {
        document.body.style.overflow = 'hidden';
        scrollLocked = true;
        virtualScroll = 0;
        waitingForTransition = false;
      }
    } else {
      animateHeart(1);
    }
  }
}

function onHeartTransitionEnd(e) {
  if (e.propertyName === 'transform' && waitingForTransition) {
    const rightTransform = heartRight.style.transform;
    const leftTransform = heartLeft.style.transform;
    if (
      rightTransform.includes('translateX(0px)') &&
      leftTransform.includes('translateX(0px)')
    ) {
      document.body.style.overflow = 'scroll';
      scrollLocked = false;
      waitingForTransition = false;
      heartRight.removeEventListener('transitionend', onHeartTransitionEnd);
      window.scrollTo({ top: joinScroll, behavior: 'auto' });
    }
  }
}

/*function handleHeartToNavbar() {
  const scrollY = window.scrollY;
  // Só executa se o coração já está unido
  if (scrollY > moveToNavbarScroll) {
    if (heartContainer && navbarHeart && navbarHeart.childElementCount === 0) {
      const clone = heartContainer.cloneNode(true);
      clone.style.transform = 'scale(0.33)';
      clone.style.transition = 'transform 0.7s cubic-bezier(.77,0,.18,1)';
      navbarHeart.innerHTML = '';
      navbarHeart.appendChild(clone);
      heartContainer.style.opacity = '0';
    }
  } else {
    if (navbarHeart && navbarHeart.childElementCount > 0) {
      navbarHeart.innerHTML = '';
      if (heartContainer) heartContainer.style.opacity = '1';
    }
  }
}*/

function onScroll() {
  handleParallaxHeart();
  //handleHeartToNavbar();
}

// Scroll virtual com mouse
window.addEventListener('wheel', (e) => {
  if (scrollLocked) {
    e.preventDefault();
    virtualScroll += e.deltaY / 3; // Menos sensível
    if (virtualScroll < 0) virtualScroll = 0;
    handleParallaxHeart();
  }
}, { passive: false });

// Scroll virtual com touch
window.addEventListener('touchstart', (e) => {
  if (scrollLocked && e.touches.length === 1) {
    lastTouchY = e.touches[0].clientY;
  }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (scrollLocked && e.touches.length === 1) {
    e.preventDefault();
    const touchY = e.touches[0].clientY;
    if (lastTouchY !== null) {
      virtualScroll -= (touchY - lastTouchY) / 3; // Menos sensível
      if (virtualScroll < 0) virtualScroll = 0;
      handleParallaxHeart();
    }
    lastTouchY = touchY;
  }
}, { passive: false });

window.addEventListener('touchend', () => {
  lastTouchY = null;
});

window.addEventListener('scroll', onScroll);

// Garante que o navegador não restaure o scroll salvo
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Geração dinâmica da galeria de polaroids
function loadPolaroids() {
  const gallery = document.querySelector('.gallery-container');
  let i = 1;
  function tryAddPhoto() {
    const img = new Image();
    img.src = `${i}.png`;
    img.onload = function() {
      const polaroid = document.createElement('div');
      polaroid.className = 'polaroid invisible';
      const caption = captions[i] && captions[i].trim() ? captions[i] : 'Geh & Juh';
      polaroid.innerHTML = `<img src='${i}.png' alt='Foto ${i}'><div class='caption'>${caption}</div>`;
      gallery.appendChild(polaroid);
      i++;
      tryAddPhoto();
    };
    img.onerror = function() {
      // Parar quando não encontrar mais imagens
    };
  }
  tryAddPhoto();
}

// Revela as polaroids ao rolar
function revealPolaroidsOnScroll() {
  const polaroids = document.querySelectorAll('.polaroid');
  if (window.scrollY > 200) {
    polaroids.forEach(p => p.classList.remove('invisible'));
  } else {
    polaroids.forEach(p => p.classList.add('invisible'));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Sempre começa travado no topo
  window.scrollTo(0, 0); // Garante scroll no topo
  document.body.style.overflow = 'hidden';
  scrollLocked = true;
  virtualScroll = 0;
  handleParallaxHeart();
  loadPolaroids();
  revealPolaroidsOnScroll();
});
window.addEventListener('scroll', revealPolaroidsOnScroll); 
