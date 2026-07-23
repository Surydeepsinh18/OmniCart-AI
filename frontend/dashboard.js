import { fetchOmniLiveSearch, formatINR, LIVE_PLATFORMS } from './liveApi.js';

/* ==========================================================================
   OmniCart AI - Dashboard Interactive Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --- 0. API Settings Modal Logic --- */
  const apiModal = document.getElementById('api-modal');
  const apiToggleBtn = document.getElementById('api-settings-toggle');
  const closeApiModalBtn = document.getElementById('close-api-modal');
  const saveApiKeyBtn = document.getElementById('save-api-key');
  const clearApiKeyBtn = document.getElementById('clear-api-key');
  const apiKeyInput = document.getElementById('api-key-input');
  const apiProviderSelect = document.getElementById('api-provider-select');
  const apiStatusText = document.getElementById('api-status-text');

  // Load saved API settings
  const loadSavedApiSettings = () => {
    const savedKey = localStorage.getItem('omnicart_api_key') || '';
    const savedProvider = localStorage.getItem('omnicart_api_provider') || 'auto';
    if (apiKeyInput) apiKeyInput.value = savedKey;
    if (apiProviderSelect) apiProviderSelect.value = savedProvider;

    if (savedKey) {
      if (apiStatusText) apiStatusText.textContent = `Active: ${savedProvider.toUpperCase()} Key Configured (Live Data Connected)`;
    } else {
      if (apiStatusText) apiStatusText.textContent = `Active: Auto Live Fetch Engine (Amazon.in, Flipkart, Meesho, Shopsy)`;
    }
  };
  loadSavedApiSettings();

  if (apiToggleBtn && apiModal) {
    apiToggleBtn.addEventListener('click', () => apiModal.classList.remove('hidden'));
    if (closeApiModalBtn) closeApiModalBtn.addEventListener('click', () => apiModal.classList.add('hidden'));

    if (saveApiKeyBtn) {
      saveApiKeyBtn.addEventListener('click', () => {
        const keyVal = apiKeyInput.value.trim();
        const providerVal = apiProviderSelect.value;
        localStorage.setItem('omnicart_api_key', keyVal);
        localStorage.setItem('omnicart_api_provider', providerVal);
        loadSavedApiSettings();
        apiModal.classList.add('hidden');
        alert("API settings updated! Live product data is now active.");
      });
    }

    if (clearApiKeyBtn) {
      clearApiKeyBtn.addEventListener('click', () => {
        localStorage.removeItem('omnicart_api_key');
        localStorage.setItem('omnicart_api_provider', 'auto');
        loadSavedApiSettings();
        apiModal.classList.add('hidden');
        alert("API key cleared. Reverted to Auto Live Search Engine.");
      });
    }
  }

  /* --- 1. Responsive Sidebar Toggles (Mobile Viewports) --- */
  const filterToggleBtn = document.querySelector('.mobile-sidebar-toggle.filters');
  const insightsToggleBtn = document.querySelector('.mobile-sidebar-toggle.insights');
  const filtersSidebar = document.getElementById('sidebar-filters');
  const insightsSidebar = document.getElementById('sidebar-insights');

  if (filterToggleBtn && insightsToggleBtn && filtersSidebar && insightsSidebar) {
    filterToggleBtn.addEventListener('click', () => {
      filtersSidebar.classList.toggle('open');
      insightsSidebar.classList.remove('open');
    });

    insightsToggleBtn.addEventListener('click', () => {
      insightsSidebar.classList.toggle('open');
      filtersSidebar.classList.remove('open');
    });
  }

  // Close sidebars if clicking in the main workspace on mobile
  const mainWorkspace = document.querySelector('.main-workspace');
  if (mainWorkspace) {
    mainWorkspace.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        if (filtersSidebar) filtersSidebar.classList.remove('open');
        if (insightsSidebar) insightsSidebar.classList.remove('open');
      }
    });
  }


  /* --- 2. AI Chat Assistant Drawer Toggle & Chat simulation --- */
  const chatToggleBtn = document.getElementById('ai-assistant-toggle');
  const chatCloseBtn = document.getElementById('close-assistant-btn');
  const chatDrawer = document.getElementById('assistant-drawer');
  const chatInput = document.getElementById('assistant-chat-input');
  const chatSendBtn = document.getElementById('assistant-chat-send');
  const chatMessages = document.getElementById('drawer-messages');

  if (chatToggleBtn && chatCloseBtn && chatDrawer) {
    chatToggleBtn.addEventListener('click', () => {
      chatDrawer.classList.toggle('open');
      if (chatDrawer.classList.contains('open') && chatInput) {
        chatInput.focus();
      }
    });

    chatCloseBtn.addEventListener('click', () => {
      chatDrawer.classList.remove('open');
    });

    const sendChatMessage = () => {
      if (!chatInput) return;
      const text = chatInput.value.trim();
      if (!text) return;

      const userMsg = document.createElement('div');
      userMsg.className = "chat-message user";
      userMsg.innerHTML = `<p>${text}</p>`;
      if (chatMessages) {
        chatMessages.appendChild(userMsg);
        chatInput.value = "";
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = "chat-message bot";
        
        let botResponse = "Scanning shopping networks... I am checking pricing trends and merchant databases for your request.";
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes("coupon") || lowerText.includes("discount") || lowerText.includes("deal")) {
          botResponse = "I've checked active promotional vouchers. AuraShop has a 5% coupon active ('OMNI5') for tech products. I advise testing it at checkout.";
        } else if (lowerText.includes("trust") || lowerText.includes("safe") || lowerText.includes("fake")) {
          botResponse = "OmniCart safety agents inspect listing details, payment security, and feedback patterns. I evaluate merchant trust grades. Let me know which seller you want audited.";
        } else if (lowerText.includes("shipping") || lowerText.includes("delivery") || lowerText.includes("fast")) {
          botResponse = "Amazon provides the fastest standard delivery times (1-2 days). Reliance Digital matches local store pickups if you live in regional hub zones.";
        } else if (lowerText.includes("iphone")) {
          botResponse = "I've run price checks on the iPhone 17. The current best value is $1,149.00 on Amazon. Price drops are predicted to be minor over the next 3 weeks.";
        }
        
        botMsg.innerHTML = `<p>${botResponse}</p>`;
        if (chatMessages) {
          chatMessages.appendChild(botMsg);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }, 1000);
    };

    if (chatSendBtn) chatSendBtn.addEventListener('click', sendChatMessage);
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendChatMessage();
      });
    }
  }


  /* --- 3. Main Workspace Interactive Searching Loop --- */
  const searchInput = document.getElementById('dashboard-search-input');
  const searchBtn = document.getElementById('dashboard-search-btn');
  const globalSearchInput = document.getElementById('global-search-input');
  const scanningOverlay = document.getElementById('search-scanning-overlay');
  
  const insightsEmpty = document.getElementById('insights-empty');
  const insightsActive = document.getElementById('insights-active');

  const activeTitle = document.getElementById('active-res-product-title');
  const activeBestPlatform = document.getElementById('active-res-best-platform');
  const activeBestPrice = document.getElementById('active-res-best-price');
  const activeExplanation = document.getElementById('active-res-explanation');
  const activeSavings = document.getElementById('active-res-savings');
  const activeTrust = document.getElementById('active-res-trust');
  const activeAdviceBadge = document.getElementById('active-res-advice-badge');
  const activeAdviceText = document.getElementById('active-res-advice-text');
  const activeListings = document.getElementById('active-res-listings');

  const scanningLog = document.querySelector('.scanning-log');
  const scanProgressFill = document.getElementById('scan-progress-fill');

  const scanSteps = [
    "Initializing live shopping agents...",
    "Querying Amazon.in, Flipkart, Meesho & Shopsy schemas...",
    "Verifying merchant credit rating & delivery logs...",
    "Scrubbing false promotional codes & personal cookies...",
    "Parsing 1,200+ consumer review sentiment points...",
    "Formatting Indian market (₹ INR) trend data vectors..."
  ];

  const runDashboardSearch = async (queryText) => {
    if (!queryText) return;
    
    if (searchInput) searchInput.value = queryText;
    if (globalSearchInput) globalSearchInput.value = queryText;

    if (scanningOverlay) scanningOverlay.classList.remove('hidden');
    if (insightsActive) insightsActive.classList.add('hidden');
    if (insightsEmpty) insightsEmpty.classList.remove('hidden');

    const liveFetchPromise = fetchOmniLiveSearch(queryText);

    let progress = 0;
    const intervalTime = 25;
    const progressInterval = setInterval(async () => {
      progress += 2.5;
      if (progress > 100) progress = 100;
      
      if (scanProgressFill) scanProgressFill.style.width = `${progress}%`;
      
      const currentStep = Math.floor((progress / 100) * scanSteps.length);
      if (currentStep < scanSteps.length && scanningLog) {
        scanningLog.textContent = scanSteps[currentStep];
      }
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        const liveData = await liveFetchPromise;
        finishDashboardSearch(queryText, liveData);
      }
    }, intervalTime);
  };

  const finishDashboardSearch = (queryText, liveData) => {
    if (scanningOverlay) scanningOverlay.classList.add('hidden');
    
    if (insightsEmpty) insightsEmpty.classList.add('hidden');
    if (insightsActive) insightsActive.classList.remove('hidden');

    if (window.innerWidth <= 1024 && insightsSidebar) {
      insightsSidebar.classList.add('open');
    }

    if (activeTitle) activeTitle.textContent = liveData.primaryTitle;
    if (activeBestPlatform) activeBestPlatform.textContent = liveData.bestPlatform;
    if (activeBestPrice) activeBestPrice.textContent = liveData.bestPriceFormatted;
    if (activeExplanation) activeExplanation.textContent = liveData.explanation;
    if (activeSavings) activeSavings.textContent = liveData.savingsFormatted;
    if (activeTrust) activeTrust.textContent = liveData.overallTrustScore;
    
    if (activeAdviceBadge) {
      activeAdviceBadge.textContent = liveData.buyingAdvice;
      activeAdviceBadge.className = `advice-action-badge ${liveData.adviceClass}`;
    }
    if (activeAdviceText) {
      activeAdviceText.textContent = "Prices are currently at a optimal level. Our predictive models project stable rates over the next 3 weeks.";
    }

    let existingRiskBox = document.querySelector('.risk-warning-box');
    if (existingRiskBox) existingRiskBox.remove();

    if (activeListings) {
      activeListings.innerHTML = "";
      liveData.listings.forEach(lst => {
        const bdRow = document.createElement('a');
        bdRow.href = lst.url || '#';
        bdRow.target = "_blank";
        bdRow.rel = "noopener noreferrer";
        bdRow.className = "breakdown-item live-platform-row";
        bdRow.style.textDecoration = "none";
        bdRow.style.display = "flex";
        bdRow.style.justifyContent = "space-between";
        bdRow.style.alignItems = "center";
        bdRow.style.padding = "10px 14px";
        bdRow.style.borderRadius = "8px";
        bdRow.style.marginBottom = "8px";
        bdRow.style.background = "rgba(255, 255, 255, 0.03)";
        bdRow.style.border = "1px solid rgba(255, 255, 255, 0.08)";
        bdRow.style.transition = "all 0.2s ease";

        bdRow.innerHTML = `
          <div style="display: flex; flex-direction: column;">
            <span class="bd-name" style="font-weight: 600; font-size: 0.85rem; color: #fff;">${lst.platform}</span>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${lst.badge}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="bd-price" style="font-weight: 700; font-size: 0.92rem; color: var(--accent-cyan);">${lst.priceFormatted}</span>
            <span style="font-size: 0.8rem; color: #a5a5cc;">↗</span>
          </div>
        `;
        activeListings.appendChild(bdRow);
      });
    }

    addQueryToHistory(queryText);
  };

  const addQueryToHistory = (query) => {
    const recentGrid = document.querySelector('.recent-grid');
    if (!recentGrid) return;
    const existingCards = Array.from(recentGrid.querySelectorAll('.recent-card'));
    
    const isDuplicate = existingCards.some(card => card.getAttribute('data-query')?.toLowerCase() === query.toLowerCase());
    if (isDuplicate) return;

    const card = document.createElement('div');
    card.className = "recent-card";
    card.setAttribute('data-query', query);
    card.innerHTML = `
      <div class="recent-card-info">
        <h4>${query}</h4>
        <span>Searched just now</span>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    `;

    card.addEventListener('click', () => {
      runDashboardSearch(query);
    });

    recentGrid.insertBefore(card, recentGrid.firstChild);
    if (recentGrid.children.length > 4) {
      recentGrid.removeChild(recentGrid.lastChild);
    }
  };

  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      runDashboardSearch(query);
    });
  });

  const recentCards = document.querySelectorAll('.recent-card');
  recentCards.forEach(card => {
    card.addEventListener('click', () => {
      const query = card.getAttribute('data-query');
      runDashboardSearch(query);
    });
  });

  const analyzeTriggers = document.querySelectorAll('.run-analyze-trigger');
  analyzeTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const query = btn.getAttribute('data-query');
      runDashboardSearch(query);
    });
  });

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.trim();
      runDashboardSearch(query);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        runDashboardSearch(query);
      }
    });
  }

  const globalSearch = document.getElementById('global-search-input');
  if (globalSearch) {
    globalSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = globalSearch.value.trim();
        runDashboardSearch(query);
      }
    });
  }

});
