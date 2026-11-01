/* ==========================================================================
   SARA KOTTAWAR — CORE PORTFOLIO ENGINE (main.js)
   Features:
     - Persistent Light/Dark Theme Toggle (localStorage + system preference)
     - Parisian Harmonic Chime (Web Audio API)
     - One-Click Email Copy with Toast Alert
     - Interactive Image Lightbox Gallery
     - Expandable Timeline Milestones
     - Clickable Curiosity Constellation
     - Interactive Contact Envelope
     - Interactive PathFinder Career Quiz Simulator
     - Accessible Keyboard Controls (ESC closes modals)
   ========================================================================== */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. THEME TOGGLE (Persistent Dark/Light Mode)
  // --------------------------------------------------------------------------
  function initTheme() {
    const savedTheme = localStorage.getItem('sara-portfolio-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme, false);

    // Update buttons on page
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme, true);
        showToast(`Theme switched to ${nextTheme === 'dark' ? 'Midnight Parisian (Dark)' : 'Ivory Editorial (Light)'}`);
      });
    });

    // Listen for OS system preference changes if user hasn't explicitly saved a choice
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('sara-portfolio-theme')) {
        setTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  }

  function setTheme(theme, save = true) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      updateThemeButtonIcons('🌙');
    } else {
      document.documentElement.removeAttribute('data-theme');
      updateThemeButtonIcons('☀️');
    }
    if (save) {
      localStorage.setItem('sara-portfolio-theme', theme);
    }
  }

  function updateThemeButtonIcons(icon) {
    document.querySelectorAll('.theme-toggle-btn .theme-icon').forEach(span => {
      span.textContent = icon;
    });
  }

  // --------------------------------------------------------------------------
  // 2. TOAST NOTIFICATION UTILITY
  // --------------------------------------------------------------------------
  window.showToast = function (msg) {
    let toast = document.getElementById('toastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotice';
      toast.className = 'toast-notice';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.innerHTML = '<span>✦</span> <span id="toastMsg"></span>';
      document.body.appendChild(toast);
    }
    const msgEl = document.getElementById('toastMsg') || toast.querySelector('span:last-child');
    if (msgEl) msgEl.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  // --------------------------------------------------------------------------
  // 3. ONE-CLICK EMAIL COPY
  // --------------------------------------------------------------------------
  function initEmailCopy() {
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.dataset.copy || 'kottawarsara@gmail.com';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(() => {
            showToast(`Email copied: ${email}`);
          }).catch(() => {
            showToast(`Contact: ${email}`);
          });
        } else {
          showToast(`Contact: ${email}`);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 4. PARISIAN HARMONIC CHIME (Web Audio API)
  // --------------------------------------------------------------------------
  let audioCtx = null;
  window.playParisChime = function () {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (French Accordion Harmonic)
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.001, audioCtx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime + idx * 0.12);
        osc.stop(audioCtx.currentTime + idx * 0.12 + 1.3);
      });

      showToast('♫ Parisian chime playing...');
    } catch (e) {
      showToast('Bonjour! Welcome to Sara\'s portfolio.');
    }
  };

  function initAudioButtons() {
    document.querySelectorAll('.audio-btn').forEach(btn => {
      btn.addEventListener('click', window.playParisChime);
    });
  }

  // --------------------------------------------------------------------------
  // 5. INTERACTIVE IMAGE LIGHTBOX GALLERY
  // --------------------------------------------------------------------------
  function initLightbox() {
    // Create lightbox modal if not exists
    let lightbox = document.getElementById('imageLightbox');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'imageLightbox';
      lightbox.className = 'lightbox-overlay';
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-modal', 'true');
      lightbox.innerHTML = `
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close image">&times;</button>
          <img src="" alt="" class="lightbox-img" id="lightboxImg">
          <p class="lightbox-caption" id="lightboxCaption"></p>
        </div>
      `;
      document.body.appendChild(lightbox);

      const closeBtn = lightbox.querySelector('.lightbox-close');
      closeBtn.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
      });
    }

    // Attach click event to all zoomable images
    document.querySelectorAll('[data-zoom], .scrap-tile img, .qual-photo img, .polaroid-img img, .project-gallery-img').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        openLightbox(img.src, img.alt || 'Portfolio image preview');
      });
    });
  }

  function openLightbox(src, caption) {
    const lightbox = document.getElementById('imageLightbox');
    const imgEl = document.getElementById('lightboxImg');
    const capEl = document.getElementById('lightboxCaption');
    if (lightbox && imgEl) {
      imgEl.src = src;
      imgEl.alt = caption;
      if (capEl) capEl.textContent = caption;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  // --------------------------------------------------------------------------
  // 6. EXPANDABLE JOURNEY TIMELINE
  // --------------------------------------------------------------------------
  function initTimelineAccordion() {
    document.querySelectorAll('.journey-step-expandable').forEach(step => {
      const header = step.querySelector('.journey-step-header');
      if (header) {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
          const isOpen = step.classList.toggle('expanded');
          const toggleIcon = step.querySelector('.toggle-indicator');
          if (toggleIcon) {
            toggleIcon.textContent = isOpen ? '−' : '+';
          }
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. CLICKABLE CURIOSITY CONSTELLATION
  // --------------------------------------------------------------------------
  const constellationData = {
    ai: {
      title: 'Artificial Intelligence & Large Language Models',
      desc: 'Exploring how prompt engineering, context framing, and agentic reasoning turn raw neural weights into practical developer workflows and urban sensors.',
      quote: '“Not just automating tasks, but augmenting human curiosity.”'
    },
    web: {
      title: 'Creative Web Craft & Parisian Editorial Design',
      desc: 'Obsessed with the poetry of layout: asymmetrical magazine balance, Cormorant Garamond typography, micro-interactions, and semantic HTML5 architectures.',
      quote: '“Code as the modern printing press of the flâneur.”'
    },
    logic: {
      title: 'Logic & Problem-Solving Foundations',
      desc: 'Starting from scratch with computational thinking, flowcharts, recursion, and step-by-step logic before diving into core Data Structures & Algorithms.',
      quote: '“Day 01 mindset: break complex problems into small, testable truths.”'
    },
    startups: {
      title: 'Startups, Product-Led Growth & Lean Velocity',
      desc: 'Studying how small, agile student teams can build functional software that directly solves community needs without bloated overhead.',
      quote: '“Solve a real dilemma first; polish the architecture second.”'
    },
    systems: {
      title: 'Software Engineering & Clean Architecture',
      desc: 'Writing modular Python and C++, understanding memory, functions, OOP principles, and collaborative Git version control.',
      quote: '“Readable code is a gift to your future collaborators.”'
    },
    urban: {
      title: 'Smart Urban Sensing & Computer Vision',
      desc: 'Investigating how existing public infrastructure (buses, dashcams) can double as mobile sensor fleets to detect potholes and damaged road dividers.',
      quote: '“Smart cities built on existing fleets, not costly new surveillance.”'
    }
  };

  window.selectCuriosityNode = function (nodeKey) {
    const data = constellationData[nodeKey];
    if (!data) return;

    // Highlight active node
    document.querySelectorAll('.constellation-node').forEach(n => n.classList.remove('active'));
    const targetNode = document.querySelector(`[data-node="${nodeKey}"]`);
    if (targetNode) targetNode.classList.add('active');

    // Update dispatch card
    const titleEl = document.getElementById('curiosityTitle');
    const descEl = document.getElementById('curiosityDesc');
    const quoteEl = document.getElementById('curiosityQuote');
    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.desc;
    if (quoteEl) quoteEl.textContent = data.quote;
  };

  // --------------------------------------------------------------------------
  // 8. INTERACTIVE CONTACT ENVELOPE
  // --------------------------------------------------------------------------
  function initEnvelope() {
    const envelope = document.getElementById('contactEnvelope');
    if (envelope) {
      envelope.addEventListener('click', () => {
        envelope.classList.toggle('unfolded');
      });
    }
  }

  // --------------------------------------------------------------------------
  // 9. PATHFINDER QUIZ SIMULATOR (Modal & In-Page)
  // --------------------------------------------------------------------------
  const tracks = {
    web: {
      title: 'Matched Path: Creative Frontend & Web Engineer',
      desc: 'You bridge human aesthetics with engineering logic. Recommended starting point: Semantic HTML5, CSS Grid & Flexbox, modern JavaScript ES6+, and component architecture.',
      phases: [
        { b: 'Phase 1: Foundations', p: 'HTML semantics, responsive design, JavaScript DOM manipulation, Git version control.' },
        { b: 'Phase 2: First Projects', p: 'Build 3 standalone apps: personal portfolio, dynamic API dashboard, interactive quiz.' },
        { b: 'Phase 3: Deepening', p: 'Framework mastery, state architecture, accessibility (WCAG), performance optimization.' }
      ]
    },
    ai: {
      title: 'Matched Path: Artificial Intelligence & Machine Learning',
      desc: 'You are energized by patterns, intelligent reasoning, and data. Recommended starting point: Python mastery, linear algebra, NumPy/Pandas, prompt architectures, and OpenAI/Gemini API integration.',
      phases: [
        { b: 'Phase 1: Python Mastery', p: 'Advanced Python, data handling libraries, probability, calculus fundamentals.' },
        { b: 'Phase 2: Applied AI Tools', p: 'Prompt engineering, fine-tuning LLMs, retrieval augmented generation (RAG).' },
        { b: 'Phase 3: Neural Networks', p: 'PyTorch/TensorFlow, model deployment, agentic systems, ethical AI.' }
      ]
    },
    systems: {
      title: 'Matched Path: Systems, Backend & Algorithmic Engineering',
      desc: 'You are fascinated by the underlying mechanics of computers, data structures, and high-performance algorithms. Recommended starting point: C++, Data Structures & Algorithms, memory management, and Unix systems.',
      phases: [
        { b: 'Phase 1: Data Structures', p: 'Arrays, linked lists, trees, graphs, sorting algorithms, big-O complexity.' },
        { b: 'Phase 2: Backend Logic', p: 'REST APIs, relational databases (SQL), caching, concurrency concepts.' },
        { b: 'Phase 3: Distributed Systems', p: 'System design, microservices, Linux internals, cloud deployment.' }
      ]
    }
  };

  window.selectQuizTrack = function (trackKey) {
    const track = tracks[trackKey];
    if (!track) return;

    document.querySelectorAll('.quiz-buttons-grid .quiz-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    if (window.event && window.event.target) {
      window.event.target.classList.add('active');
    }

    const titleEl = document.getElementById('quizResultTitle');
    const descEl = document.getElementById('quizResultDesc');
    const previewEl = document.getElementById('roadmapPreview');

    if (titleEl) titleEl.textContent = track.title;
    if (descEl) descEl.textContent = track.desc;

    if (previewEl) {
      previewEl.innerHTML = track.phases.map(p => `
        <div class="roadmap-card">
          <b>${p.b}</b>
          <p>${p.p}</p>
        </div>
      `).join('');
    }
  };

  window.openDemoModal = function () {
    const modal = document.getElementById('demoModal');
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeDemoModal = function () {
    const modal = document.getElementById('demoModal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  // Close modals on Escape key or backdrop click
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      window.closeDemoModal();
      closeLightbox();
    }
  });

  const demoModal = document.getElementById('demoModal');
  if (demoModal) {
    demoModal.addEventListener('click', e => {
      if (e.target === demoModal) window.closeDemoModal();
    });
  }

  // --------------------------------------------------------------------------
  // 10. SCROLL REVEAL (IntersectionObserver)
  // --------------------------------------------------------------------------
  function initScrollReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.08 });
      items.forEach(i => io.observe(i));
    } else {
      items.forEach(i => i.classList.add('in'));
    }
  }

  // --------------------------------------------------------------------------
  // INITIALIZE ON DOM READY
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initEmailCopy();
    initAudioButtons();
    initLightbox();
    initTimelineAccordion();
    initEnvelope();
    initScrollReveal();
  });
})();

