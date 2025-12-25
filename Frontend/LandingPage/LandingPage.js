document.addEventListener('DOMContentLoaded', () => {
    // Function to handle scroll animations
    const handleScrollAnimations = () => {
      const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };
  
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);
  
      elementsToAnimate.forEach(el => {
        observer.observe(el);
      });
    };
  
    // Function for smooth scroll navigation
    const smoothScroll = () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);
  
          if (targetElement) {
            window.scrollTo({
              top: targetElement.offsetTop - document.querySelector('.nav').offsetHeight,
              behavior: 'smooth'
            });
          }
        });
      });
    };
  
    handleScrollAnimations();
    smoothScroll();
  
    // Background animation logic (existing)
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let width, height;
    let resizeTimeout;
  
    // Class to represent a single node (dot)
    class Node {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = 1;
      }
  
      // Method to draw the node
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      }
  
      // Method to update the node's position
      update() {
        this.x += this.vx;
        this.y += this.vy;
  
        // Wrap around the edges of the canvas
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }
    }
  
    // Function to set up the canvas dimensions and initial nodes
    function setupCanvas() {
      width = window.innerWidth;
      height = document.body.scrollHeight; // Set height to the full scrollable height
      canvas.width = width;
      canvas.height = height;
      nodes = [];
      for (let i = 0; i < 100; i++) {
        nodes.push(new Node());
      }
    }
  
    // Function to draw lines between nearby nodes
    function drawLines() {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
  
          // Connect nodes that are close to each other
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 100})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }
  
    // The main animation loop
    function animate() {
      ctx.clearRect(0, 0, width, height);
      drawLines();
      nodes.forEach(node => {
        node.update();
        node.draw();
      });
      requestAnimationFrame(animate);
    }
  
    // Resize event listener to update canvas dimensions with a debounce
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setupCanvas();
      }, 250); // Debounce delay
    });
  
    // Initial setup and start of the animation
    setupCanvas();
    animate();

    // Chat-style particle animation behind everything
    (function initChatParticles(){
      const pCanvas = document.getElementById('bg-canvas');
      if (!pCanvas) return;
      const pCtx = pCanvas.getContext('2d');
      let particles = [];
      const mouse = { x: undefined, y: undefined };

      function initCanvas() {
        pCanvas.width = window.innerWidth;
        pCanvas.height = window.innerHeight;
      }

      window.addEventListener('resize', () => { initCanvas(); createParticles(); });
      window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });

      class Particle {
        constructor() {
          this.x = Math.random() * pCanvas.width;
          this.y = Math.random() * pCanvas.height;
          this.size = Math.random() * 2 + 0.5;
          this.speedX = Math.random() * 0.5 - 0.25;
          this.speedY = Math.random() * 0.5 - 0.25;
          this.color = 'rgba(255, 255, 255, 0.5)';
        }
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          if (this.x > pCanvas.width || this.x < 0) this.speedX *= -1;
          if (this.y > pCanvas.height || this.y < 0) this.speedY *= -1;
          const dx = (mouse.x || 0) - this.x;
          const dy = (mouse.y || 0) - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) { this.x -= dx / 50; this.y -= dy / 50; }
        }
        draw() {
          pCtx.fillStyle = this.color;
          pCtx.beginPath();
          pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          pCtx.fill();
        }
      }

      function createParticles() {
        particles = [];
        const count = pCanvas.width / 15;
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
              pCtx.strokeStyle = 'rgba(255, 255, 255,' + opacity + ')';
              pCtx.lineWidth = 1;
              pCtx.beginPath();
              pCtx.moveTo(particles[a].x, particles[a].y);
              pCtx.lineTo(particles[b].x, particles[b].y);
              pCtx.stroke();
            }
          }
        }
      }

      function animateParticles() {
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        connectParticles();
        requestAnimationFrame(animateParticles);
      }

      initCanvas();
      createParticles();
      animateParticles();
    })();
  });

