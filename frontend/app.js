/* ==========================================================================
   OmniCart AI - Interactive Web Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* 1. Header Sticky & Blur Scroll Effect */
  const header = document.getElementById('header');
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Init on load in case page is refreshed while scrolled


  /* 2. Mobile Menu Toggle Drawer */
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const toggleMobileMenu = () => {
    mobileToggle.classList.toggle('active');
    mobileNav.classList.toggle('open');
    
    // Animate hamburger bars to X shape
    const bars = mobileToggle.querySelectorAll('.bar');
    if (mobileNav.classList.contains('open')) {
      bars[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      bars[0].style.transform = 'none';
      bars[1].style.opacity = '1';
      bars[2].style.transform = 'none';
    }
  };

  mobileToggle.addEventListener('click', toggleMobileMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) {
        toggleMobileMenu();
      }
    });
  });


  /* 3. Intersection Observer for Scroll Reveal Animations */
  const revealElements = document.querySelectorAll('.scroll-reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });


  /* 4. Active Link State on Scroll */
  const sections = document.querySelectorAll('section, header');
  const navLinks = document.querySelectorAll('.nav-link');

  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (id) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      }
    });
  }, {
    threshold: 0.4,
    rootMargin: '-20% 0px -40% 0px'
  });

  sections.forEach(sec => {
    activeObserver.observe(sec);
  });


  /* 5. Hero Dashboard Search Simulation (Typewriter Effect) */
  const mockQueries = [
    "wireless noise-cancelling headphones",
    "mechanical gaming keyboard RGB",
    "4k laser projector home theater",
    "ultralight hybrid carbon road bike",
    "ergonomic mesh office task chair"
  ];

  const searchTextEl = document.getElementById('dashboard-search-text');
  let currentQueryIndex = 0;
  let typewriterTimeout = null;

  const runTypewriterSimulation = async () => {
    if (!searchTextEl) return;
    const query = mockQueries[currentQueryIndex];
    searchTextEl.textContent = "";
    
    // Typing animation
    for (let i = 0; i <= query.length; i++) {
      searchTextEl.textContent = query.slice(0, i) + "|";
      await new Promise(r => setTimeout(r, 60));
    }
    searchTextEl.textContent = query; // Remove cursor character

    // Wait and then simulate results update animation
    await new Promise(r => setTimeout(r, 800));
    simulateDashboardDataUpdate();

    // Stay on query for some time, then type next query
    await new Promise(r => setTimeout(r, 4500));
    currentQueryIndex = (currentQueryIndex + 1) % mockQueries.length;
    runTypewriterSimulation();
  };

  // Simulate data fluctuations on the dashboard to look dynamic
  const simulateDashboardDataUpdate = () => {
    // 1. OmniScore update
    const omniNum = document.querySelector('.score-num');
    if (!omniNum) return;
    const targetScore = Math.floor(Math.random() * 15) + 81; // 81 to 95
    let currentScore = parseInt(omniNum.textContent);
    
    const scoreInterval = setInterval(() => {
      if (currentScore < targetScore) currentScore++;
      else if (currentScore > targetScore) currentScore--;
      else clearInterval(scoreInterval);
      
      omniNum.textContent = currentScore;
      
      // Update circular chart stroke dasharray
      const circlePath = document.querySelector('.circle');
      if (circlePath) {
        circlePath.setAttribute('stroke-dasharray', `${currentScore}, 100`);
      }
    }, 30);

    // 2. Marketplace Prices update
    const prices = [
      (Math.random() * 80 + 180).toFixed(2), // aura
      (Math.random() * 80 + 200).toFixed(2), // nexus
      (Math.random() * 80 + 170).toFixed(2)  // vortex
    ];
    
    const priceElements = document.querySelectorAll('.platform-price');
    if (priceElements && priceElements.length >= 3) {
      priceElements[0].textContent = `$${prices[0]}`;
      priceElements[1].textContent = `$${prices[1]}`;
      priceElements[2].textContent = `$${prices[2]}`;
    }

    // Adjust comparison bar widths relative to pricing
    const bars = document.querySelectorAll('.progress-bar-fill');
    if (bars && bars.length >= 3) {
      bars[0].style.width = `${Math.floor(Math.random() * 20) + 75}%`;
      bars[1].style.width = `${Math.floor(Math.random() * 20) + 70}%`;
      bars[2].style.width = `${Math.floor(Math.random() * 20) + 60}%`;
    }

    // 3. Update Chart path slightly
    const sparkline = document.querySelector('.sparkline path:first-of-type');
    if (sparkline) {
      const yValues = Array.from({length: 8}, () => Math.floor(Math.random() * 50) + 15);
      const newDPath = `M 0 ${yValues[0]} L 25 ${yValues[1]} L 50 ${yValues[2]} L 75 ${yValues[3]} L 100 ${yValues[4]} L 125 ${yValues[5]} L 150 ${yValues[6]} L 180 ${yValues[7]}`;
      sparkline.setAttribute('d', newDPath);
      
      // Also update background fill polygon path
      const fillPath = document.querySelector('.sparkline path:nth-of-type(2)');
      if (fillPath) {
        fillPath.setAttribute('d', `${newDPath} L 180 80 L 0 80 Z`);
      }
    }
  };

  // Start the infinite loop
  runTypewriterSimulation();

});
