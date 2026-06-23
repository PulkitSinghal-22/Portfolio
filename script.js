// Pulkit Singhal Portfolio Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTypingEffect();
  initScrollAnimations();
  initContactForm();
});

// 1. Sticky Navbar & Active Section Link Highlight
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const navLinkItems = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  // Change navbar on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll Spy active navigation link
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop - varNavHeight()) {
        current = section.getAttribute('id');
      }
    });

    navLinkItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  function varNavHeight() {
    return navbar.clientHeight || 80;
  }

  // Mobile menu toggle
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Animate hamburger to X
    menuToggle.classList.toggle('open');
    if (menuToggle.classList.contains('open')) {
      menuToggle.children[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
      menuToggle.children[1].style.opacity = '0';
      menuToggle.children[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
    } else {
      menuToggle.children[0].style.transform = 'none';
      menuToggle.children[1].style.opacity = '1';
      menuToggle.children[2].style.transform = 'none';
    }
  });

  // Close menu on click of nav link on mobile
  navLinkItems.forEach(item => {
    item.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('open');
      menuToggle.children[0].style.transform = 'none';
      menuToggle.children[1].style.opacity = '1';
      menuToggle.children[2].style.transform = 'none';
    });
  });
}

// 2. Typing effect in Hero Section
function initTypingEffect() {
  const words = ["React.js Applications", "Tailwind CSS Layouts", "MERN Stack Solutions", "High-Performance UIs"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typedTextEl = document.getElementById('typed-text');
  let typeSpeed = 100;

  function type() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      typedTextEl.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 50; // speed up deleting
    } else {
      typedTextEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 120; // typing speed
    }

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      typeSpeed = 1800; // Pause at end of word
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 400; // Pause before typing next word
    }

    setTimeout(type, typeSpeed);
  }

  // Start typing
  if (typedTextEl) {
    type();
  }
}

// 3. Scroll Reveal & Skill Bar Animation
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  const skillBars = document.querySelectorAll('.skill-bar-fill');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        
        // Trigger skill bars loading specifically
        if (entry.target.id === 'skills') {
          animateSkillBars();
        }
      }
    });
  }, {
    threshold: 0.15
  });

  reveals.forEach(reveal => {
    revealObserver.observe(reveal);
  });

  function animateSkillBars() {
    skillBars.forEach(bar => {
      const percentage = bar.getAttribute('data-percentage');
      bar.style.width = percentage;
    });
  }
}

// 4. Modal Project Details for Pulkit Singhal
const projectsData = {
  smartserve: {
    title: "Smart Serve (MERN Stack Platform)",
    metrics: "Designed a secure multi-tier booking platform showing a 30% reduction in dashboard loading speeds.",
    technologies: ["React.js", "Node.js", "Express.js", "MongoDB", "Tailwind CSS", "MERN Stack"],
    features: [
      "Designed full-stack multi-tier booking structure separating Customer, Vendor, and Admin privileges.",
      "Integrated search engine filters with dynamic geo-location components.",
      "Engineered clean database aggregation queries to generate transparent vendor payout statements.",
      "Ensured pricing calculations eliminate hidden platform costs through client-side state hooks."
    ],
    contribution: "Programmed front-end modules, backend controller logics, database queries, and dashboard charts from scratch."
  },
  spotify: {
    title: "Spotify Clone Application",
    metrics: "Optimized music playback pipelines reducing component redundancy by 40% with zero rendering lag.",
    technologies: ["React.js", "Tailwind CSS", "HTML5 Audio Context", "Component Lifecycle Hooks"],
    features: [
      "Successfully cloned 5+ core Spotify features (playlist management, music progress seek, control deck, album covers).",
      "Employed React states to handle background track switching smoothly without visual blocking.",
      "Coded 100% mobile-responsive layout structure using Tailwind Grid system and absolute viewport breakpoints."
    ],
    contribution: "Engineered context providers to cleanly distribute music playback states globally to control panels."
  },
  trading: {
    title: "Beginner Trading Application",
    metrics: "Streamlined vanilla scripts and stylesheet bundles to load fully within 1.5 seconds.",
    technologies: ["HTML5", "CSS3", "Vanilla JavaScript (ES6+)", "SVG Graph Rendering"],
    features: [
      "Simplified 10+ core stock trading rules, chart patterns, and concepts for novice investors.",
      "Created 3+ interactive learning panels for simulation testing of technical market analysis indicators.",
      "Optimized rendering of responsive vector graphics (SVG) to support interactive graph tracing."
    ],
    contribution: "Researched indicators, styled the interface, and built all dynamic graph canvas math scripts."
  }
};

function openProjectModal(projectId) {
  const project = projectsData[projectId];
  if (!project) return;

  const modal = document.getElementById('project-modal');
  const modalContentEl = document.getElementById('modal-body-content');

  // Hydrate modal HTML
  modalContentEl.innerHTML = `
    <h3 class="modal-title">${project.title}</h3>
    
    <div class="project-metrics" style="margin-bottom: 1.5rem; width: 100%;">
      <i class="fa-solid fa-square-poll-vertical"></i> <strong>Performance Impact:</strong> ${project.metrics}
    </div>

    <div class="modal-section-title">Key Features</div>
    <ul class="modal-bullet-list">
      ${project.features.map(feat => `<li>${feat}</li>`).join('')}
    </ul>

    <div class="modal-section-title">Technologies Used</div>
    <div class="project-tags" style="margin-top: 0.5rem; margin-bottom: 1.5rem;">
      ${project.technologies.map(tech => `<span class="project-tag" style="background: rgba(124,77,255,0.08); border-color: rgba(124,77,255,0.25); color: var(--text-main); font-size: 0.85rem; padding: 0.5rem 1rem;">${tech}</span>`).join('')}
    </div>

    <div class="modal-section-title">Operational Context & Contribution</div>
    <p style="color: var(--text-muted); line-height: 1.7;">${project.contribution}</p>
  `;

  // Display modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Stop background scroll
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  modal.classList.remove('active');
  document.body.style.overflow = ''; // Re-enable scroll
}

// Esc close modal keybinding
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProjectModal();
  }
});

// 5. Contact Form Simulation
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit-btn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const message = document.getElementById('form-message').value.trim();

    if (!name || !email || !message) {
      showStatus("Please fill in all the fields before submitting.", "error");
      return;
    }

    // Set submitting status UI
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Sending... <i class="fa-solid fa-spinner fa-spin"></i>`;
    statusEl.style.display = 'none';

    // Post to FormSubmit AJAX endpoint
    fetch("https://formsubmit.co/ajax/pulkitsinghal622@gmail.com", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        name: name,
        email: email,
        message: message,
        _subject: `New Portfolio Message from ${name}`
      })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Could not send email. Please try again later.");
      }
    })
    .then(data => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Send Message <i class="fa-solid fa-paper-plane"></i>`;
      showStatus(`Thank you, ${name}! Your message has been sent successfully. I will get back to you soon.`, "success");
      form.reset();
    })
    .catch(error => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Send Message <i class="fa-solid fa-paper-plane"></i>`;
      showStatus(error.message || "An error occurred while sending your message. Please try again.", "error");
    });
  });

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = `form-status ${type}`;
    statusEl.style.display = 'block';
    
    // Auto-scroll slightly to show the message status clearly if needed
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
