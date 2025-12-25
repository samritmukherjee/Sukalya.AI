// Background canvas subtle particles (optional for cohesion)
// Mirror chat page particle animation
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  const mouse = { x: undefined, y: undefined };

  function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', () => { initCanvas(); createParticles(); });
  window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.color = 'rgba(255, 255, 255, 0.5)';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
      if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      const dx = (mouse.x || 0) - this.x;
      const dy = (mouse.y || 0) - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 150) { this.x -= dx / 50; this.y -= dy / 50; }
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function createParticles() {
    particles = [];
    const count = canvas.width / 15;
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          const opacity = 1 - (distance / 100);
          ctx.strokeStyle = 'rgba(255, 255, 255,' + opacity + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    createParticles();
    animate();
  });
})();

// Fade-in animation trigger (in case of dynamic content)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.animate').forEach((el, i) => {
    el.style.animationDelay = (i * 80) + 'ms';
    el.classList.add('in');
  });
});

// Click-to-zoom functionality for certificate image
(function setupZoom() {
  const img = document.getElementById('certificateImage');
  const overlay = document.getElementById('overlay');
  const overlayImg = document.getElementById('overlayImg');
  if (!img || !overlay || !overlayImg) return;

  img.addEventListener('click', () => {
    overlayImg.src = img.src;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
  });

  overlay.addEventListener('click', () => {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
  });
})();

// Hover glow effects for verified badge (extra pulse)
(function badgeHover() {
  const badge = document.getElementById('verifiedBadge');
  if (!badge) return;
  badge.addEventListener('mouseenter', () => {
    badge.style.transform = 'scale(1.08)';
    badge.style.boxShadow = '0 0 28px rgba(52,152,219,1), 0 0 45px rgba(44,62,80,1)';
  });
  badge.addEventListener('mouseleave', () => {
    badge.style.transform = '';
    badge.style.boxShadow = '';
  });
})();


