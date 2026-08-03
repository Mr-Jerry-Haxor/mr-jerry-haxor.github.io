(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('.scroll-progress span');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const sections = [...document.querySelectorAll('main section[id]')];

  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  function updateScrollUI() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    progress.style.height = `${Math.min(100, ratio * 100)}%`;
    header.classList.toggle('scrolled', window.scrollY > 24);

    let activeId = '';
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 180) activeId = section.id;
    });
    navLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${activeId}`));
  }

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('open', !isOpen);
  });

  navLinks.forEach((link) => link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
  }));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  document.querySelectorAll('.reveal').forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    revealObserver.observe(element);
  });

  if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const glow = document.querySelector('.cursor-glow');
    window.addEventListener('pointermove', (event) => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });

    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateY(${x * 5}deg) rotateX(${y * -5}deg)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    const scene = document.querySelector('[data-tilt-scene]');
    const visualCard = scene.querySelector('.visual-card');
    scene.addEventListener('pointermove', (event) => {
      const rect = scene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      visualCard.style.transform = `rotateY(${x * 14 - 8}deg) rotateX(${y * -10 + 3}deg) translateZ(16px)`;
    });
    scene.addEventListener('pointerleave', () => { visualCard.style.transform = ''; });
  }

  const roleElement = document.querySelector('[data-role]');
  const roles = ['Cybersecurity Engineer', 'Penetration Tester', 'AI Security Researcher', 'Cloud Security Engineer'];
  if (!reducedMotion && roleElement) {
    let roleIndex = 0;
    window.setInterval(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      roleElement.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 220, fill: 'forwards' }).finished.then(() => {
        roleElement.textContent = roles[roleIndex];
        roleElement.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280, fill: 'forwards' });
      });
    }, 2800);
  }

  const canvas = document.querySelector('#network-canvas');
  if (canvas) {
    const context = canvas.getContext('2d');
    let nodes = [];
    let canvasWidth = 0;
    let canvasHeight = 0;

    const resizeNetwork = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvasWidth = canvas.clientWidth;
      canvasHeight = canvas.clientHeight;
      canvas.width = Math.round(canvasWidth * ratio);
      canvas.height = Math.round(canvasHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(24, Math.min(48, Math.round(canvasWidth / 28)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18
      }));
    };

    const drawNetwork = () => {
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      nodes.forEach((node, index) => {
        if (!reducedMotion) {
          node.x = (node.x + node.vx + canvasWidth) % canvasWidth;
          node.y = (node.y + node.vy + canvasHeight) % canvasHeight;
        }
        context.fillStyle = index % 5 === 0 ? '#7c3aed' : '#06b6d4';
        context.beginPath();
        context.arc(node.x, node.y, index % 5 === 0 ? 1.8 : 1.1, 0, Math.PI * 2);
        context.fill();
        for (let otherIndex = index + 1; otherIndex < nodes.length; otherIndex += 1) {
          const other = nodes[otherIndex];
          const distance = Math.hypot(node.x - other.x, node.y - other.y);
          if (distance < 135) {
            context.strokeStyle = `rgba(37, 99, 235, ${0.12 * (1 - distance / 135)})`;
            context.lineWidth = 0.7;
            context.beginPath();
            context.moveTo(node.x, node.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }
      });
      if (!reducedMotion) requestAnimationFrame(drawNetwork);
    };

    resizeNetwork();
    drawNetwork();
    window.addEventListener('resize', resizeNetwork, { passive: true });
  }

  const terminalLauncher = document.querySelector('.terminal-launcher');
  const terminal = document.querySelector('.terminal-window');
  const terminalClose = document.querySelector('[data-terminal-close]');
  const terminalForm = document.querySelector('[data-terminal-form]');
  const terminalInput = document.querySelector('#terminal-command');
  const terminalOutput = document.querySelector('[data-terminal-output]');

  const setTerminalOpen = (open) => {
    terminal.hidden = !open;
    terminalLauncher.setAttribute('aria-expanded', String(open));
    if (open) terminalInput.focus();
  };
  terminalLauncher.addEventListener('click', () => setTerminalOpen(terminal.hidden));
  terminalClose.addEventListener('click', () => setTerminalOpen(false));

  const printTerminal = (message, link) => {
    const line = document.createElement('p');
    line.textContent = message;
    if (link) {
      const anchor = document.createElement('a');
      anchor.href = link.href;
      anchor.textContent = link.label;
      if (link.external) { anchor.target = '_blank'; anchor.rel = 'noreferrer'; }
      line.append(' ', anchor);
    }
    terminalOutput.append(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  };

  terminalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const command = terminalInput.value.trim().toLowerCase();
    terminalInput.value = '';
    if (!command) return;
    printTerminal(`visitor@portfolio:~$ ${command}`);
    const commands = {
      help: () => printTerminal('Commands: about, skills, projects, research, certifications, resume, contact, clear'),
      about: () => printTerminal('Shravan is a cybersecurity engineer, penetration tester, AI security researcher, and secure software builder.'),
      skills: () => printTerminal('Core domains: offensive security, AI governance, Azure security, secure engineering, automation, cloud, backend, and mobile.'),
      projects: () => { document.querySelector('#work').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); printTerminal('Opening selected work…'); },
      research: () => { document.querySelector('#research').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); printTerminal('Opening Cyber Lab research directions…'); },
      certifications: () => { document.querySelector('#credentials').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); printTerminal('Opening credentials…'); },
      resume: () => printTerminal('Résumé ready:', { href: 'Shravan_Jeripothula_Resume.pdf', label: 'download PDF' }),
      contact: () => printTerminal('Start a conversation:', { href: 'mailto:jerryshravan@gmail.com', label: 'jerryshravan@gmail.com' }),
      clear: () => { terminalOutput.replaceChildren(); }
    };
    (commands[command] || (() => printTerminal(`Command not found: ${command}. Type help.`)))();
  });

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => { updateScrollUI(); ticking = false; });
    ticking = true;
  }, { passive: true });
  updateScrollUI();
})();
