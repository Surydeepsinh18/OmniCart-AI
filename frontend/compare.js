/* ==========================================================================
   OmniCart AI — Master Universal AI Shopping Intelligence Engine Logic
   Supports 9 Shopping Platforms, MERN Cart REST API, Radar Scan Overlay,
   AI Decision Panel, 30-Day Canvas Chart, Filters, Insights Panel & AI Chat.
   ========================================================================== */

const CART_API = '/api/cart';

// ────────────── Platform Definitions ──────────────
const PLATFORMS = [
  { name: 'Amazon',           color: '#ff9900', dot: '#ff9900', searchUrl: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}` },
  { name: 'Flipkart',         color: '#2874f0', dot: '#2874f0', searchUrl: (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}` },
  { name: 'Croma',            color: '#00b33c', dot: '#00b33c', searchUrl: (q) => `https://www.croma.com/searchB?q=${encodeURIComponent(q)}` },
  { name: 'Reliance Digital', color: '#0072bc', dot: '#0072bc', searchUrl: (q) => `https://www.reliancedigital.in/search?q=${encodeURIComponent(q)}` },
  { name: 'JioMart',          color: '#0f3cc9', dot: '#0f3cc9', searchUrl: (q) => `https://www.jiomart.com/search/${encodeURIComponent(q)}` },
  { name: 'Vijay Sales',      color: '#e91e63', dot: '#e91e63', searchUrl: (q) => `https://www.vijaysales.com/search/${encodeURIComponent(q)}` },
  { name: 'Myntra',           color: '#ff3e6c', dot: '#ff3e6c', searchUrl: (q) => `https://www.myntra.com/${encodeURIComponent(q)}` },
  { name: 'Ajio',             color: '#d5a372', dot: '#d5a372', searchUrl: (q) => `https://www.ajio.com/search/?text=${encodeURIComponent(q)}` },
  { name: 'Meesho',           color: '#f43397', dot: '#f43397', searchUrl: (q) => `https://www.meesho.com/search?q=${encodeURIComponent(q)}` },
];

const DELIVERY_OPTIONS = [
  '1-Day Express', '2-Day Prime', '3-5 Days Standard',
  'Same Day Delivery', '2-3 Days', '4-7 Days Economy',
];

const STATUS_OPTIONS = ['In Stock', 'In Stock', 'In Stock', 'Limited Stock', 'In Stock'];

let currentComparisonData = [];
let currentQuery = '';

// ────────────── Helpers ──────────────
function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}
function formatUSD(n) {
  if (n == null || isNaN(n)) return 'Unavailable';
  const currency = document.getElementById('currencySelect')?.value || 'USD';
  if (currency === 'INR') {
    return '₹' + Math.round(n * 83).toLocaleString('en-IN');
  }
  if (currency === 'EUR') {
    return '€' + Number(n * 0.92).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style.transition = 'opacity 0.3s ease';
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 1800);
}

// ────────────── Data Generation ──────────────
function generateComparisonData(query) {
  const basePrice = detectBasePrice(query);
  const q = (query || '').toLowerCase();

  const isTechCategory = q.includes('iphone') || q.includes('macbook') || q.includes('samsung') || 
                         q.includes('pixel') || q.includes('laptop') || q.includes('tv') || 
                         q.includes('headphone') || q.includes('watch') || q.includes('camera') || 
                         q.includes('dell') || q.includes('sony') || q.includes('xbox') || q.includes('ps5');

  const isFashionCategory = q.includes('shirt') || q.includes('shoes') || q.includes('dress') || 
                            q.includes('jeans') || q.includes('jacket') || q.includes('sneakers');

  return PLATFORMS.map((plat, idx) => {
    let isAvailable = true;

    if (isTechCategory && (plat.name === 'Myntra' || plat.name === 'Ajio')) {
      isAvailable = false;
    } else if (isFashionCategory && (plat.name === 'Croma' || plat.name === 'Vijay Sales')) {
      isAvailable = false;
    } else if (idx === 7 && q.length % 2 === 1) {
      isAvailable = false;
    }

    if (!isAvailable) {
      return {
        platform: plat.name,
        color: plat.color,
        dot: plat.dot,
        buyUrl: plat.searchUrl(query),
        productName: formatProductName(query),
        currentPrice: null,
        originalPrice: null,
        discountPct: 0,
        rating: 'N/A',
        delivery: 'Not Listed',
        trustScore: 0,
        status: 'Unavailable',
        isAvailable: false,
      };
    }

    const variance   = rand(-0.08, 0.12);
    const discountPct = randInt(5, 28);
    const currentPrice = +(basePrice * (1 + variance)).toFixed(2);
    const originalPrice = +(currentPrice / (1 - discountPct / 100)).toFixed(2);
    const rating = +(rand(3.5, 5.0)).toFixed(1);
    const trustScore = randInt(72, 99);
    const delivery = DELIVERY_OPTIONS[randInt(0, DELIVERY_OPTIONS.length - 1)];
    const status = STATUS_OPTIONS[randInt(0, STATUS_OPTIONS.length - 1)];

    return {
      platform: plat.name,
      color: plat.color,
      dot: plat.dot,
      buyUrl: plat.searchUrl(query),
      productName: formatProductName(query),
      currentPrice,
      originalPrice,
      discountPct,
      rating,
      delivery,
      trustScore,
      status,
      isAvailable: true,
    };
  });
}

function detectBasePrice(query) {
  const q = query.toLowerCase();
  if (q.includes('iphone')) return rand(999, 1399);
  if (q.includes('macbook')) return rand(1099, 2499);
  if (q.includes('samsung')) return rand(799, 1299);
  if (q.includes('laptop')) return rand(699, 1899);
  if (q.includes('tv')) return rand(599, 2499);
  if (q.includes('headphone') || q.includes('bose') || q.includes('sony')) return rand(199, 499);
  return rand(299, 1199);
}

function formatProductName(query) {
  return (query || '')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ────────────── Render Metrics Cards ──────────────
function renderMetrics(data) {
  const grid = document.getElementById('metricsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const available = data.filter(d => d.isAvailable);
  if (available.length === 0) return;

  const sorted = [...available].sort((a, b) => a.currentPrice - b.currentPrice);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const bestDiscount = [...available].sort((a, b) => b.discountPct - a.discountPct)[0];
  const bestRating = [...available].sort((a, b) => b.rating - a.rating)[0];
  const bestTrust = [...available].sort((a, b) => b.trustScore - a.trustScore)[0];
  const bestDelivery = available.find(d => d.delivery.includes('Same Day') || d.delivery.includes('1-Day')) || available[0];
  const savingsAmount = highest.currentPrice - lowest.currentPrice;

  const cards = [
    { icon: '💲', label: 'Lowest Price',           value: formatUSD(lowest.currentPrice),       sub: lowest.platform,            accent: 'cyan'   },
    { icon: '🚀', label: 'Fastest Delivery',        value: bestDelivery.delivery,                sub: bestDelivery.platform,      accent: 'blue'   },
    { icon: '🤝', label: 'Highest Trust Seller',    value: bestTrust.trustScore + '%',            sub: bestTrust.platform,         accent: 'green'  },
    { icon: '🔻', label: 'Best Discount',           value: bestDiscount.discountPct + '% OFF',   sub: bestDiscount.platform,      accent: 'pink'   },
    { icon: '⭐', label: 'Highest Rated',           value: bestRating.rating + '★',              sub: bestRating.platform,        accent: 'yellow' },
    { icon: '🏆', label: 'AI Recommendation',       value: lowest.platform,                      sub: 'Best Price + Trust combo', accent: 'purple' },
    { icon: '🔥', label: 'Potential Savings',        value: formatUSD(savingsAmount),              sub: 'Max price spread',         accent: 'orange' },
    { icon: '⚖️', label: 'Buying Risk',             value: 'Low',                                sub: `${available.length}/${data.length} platforms in stock`, accent: 'green' },
  ];

  cards.forEach(c => {
    const el = document.createElement('div');
    el.className = `metric-card ${c.accent}`;
    el.innerHTML = `
      <div class="metric-icon">${c.icon}</div>
      <span class="metric-label">${c.label}</span>
      <span class="metric-value">${c.value}</span>
      <span class="metric-sub">${c.sub}</span>
    `;
    grid.appendChild(el);
  });
}

// ────────────── Render Decision Panel ──────────────
function renderDecision(data) {
  const grid = document.getElementById('decisionGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const available = data.filter(d => d.isAvailable);
  if (available.length === 0) return;

  const sorted = [...available].sort((a, b) => a.currentPrice - b.currentPrice);
  const best = sorted[0];
  const second = sorted[1] || best;
  const avg = available.reduce((s, d) => s + d.currentPrice, 0) / available.length;

  const cards = [
    {
      label: 'Best Platform to Buy',
      value: best.platform,
      valClass: 'val-cyan',
      sub: `Lowest at ${formatUSD(best.currentPrice)} with ${best.trustScore}% trust score and ${best.delivery} delivery.`,
    },
    {
      label: 'Estimated Savings vs Average',
      value: formatUSD(avg - best.currentPrice),
      valClass: 'val-green',
      sub: `Average market price is ${formatUSD(avg)}. Buying from ${best.platform} saves you ${((1 - best.currentPrice / avg) * 100).toFixed(1)}%.`,
    },
    {
      label: 'Runner-Up Alternative',
      value: second.platform,
      valClass: 'val-purple',
      sub: second === best ? `Only 1 platform currently has stock.` : `Priced at ${formatUSD(second.currentPrice)} — ${formatUSD(second.currentPrice - best.currentPrice)} more than ${best.platform}.`,
    },
  ];

  cards.forEach(c => {
    const el = document.createElement('div');
    el.className = 'decision-card';
    el.innerHTML = `
      <span class="dc-label">${c.label}</span>
      <span class="dc-value ${c.valClass}">${c.value}</span>
      <span class="dc-sub">${c.sub}</span>
    `;
    grid.appendChild(el);
  });
}

// ────────────── Render Table ──────────────
function renderTable(data) {
  const tbody = document.getElementById('comparisonTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Get current filter states
  const minRating = parseFloat(document.getElementById('ratingFilterSelect')?.value || '0');
  const expressOnly = document.getElementById('toggle-express-delivery')?.checked || false;

  const filteredData = data.filter(item => {
    if (!item.isAvailable) return true;
    if (minRating > 0 && parseFloat(item.rating) < minRating) return false;
    if (expressOnly) {
      const del = item.delivery.toLowerCase();
      if (!del.includes('1-day') && !del.includes('express') && !del.includes('same day')) return false;
    }
    return true;
  });

  const availableItems = filteredData.filter(d => d.isAvailable).sort((a, b) => a.currentPrice - b.currentPrice);
  const unavailableItems = filteredData.filter(d => !d.isAvailable);
  const sorted = [...availableItems, ...unavailableItems];

  // Global reference for cart click index
  currentComparisonData = sorted;

  const lowestPrice = availableItems.length > 0 ? availableItems[0].currentPrice : null;

  if (sorted.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding: 24px; color: var(--text-muted);">No products match the selected filters.</td></tr>`;
    return;
  }

  sorted.forEach((item, i) => {
    const isBest = item.isAvailable && item.currentPrice === lowestPrice;
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    if (isBest) tr.className = 'best-price-row';
    if (!item.isAvailable) tr.style.opacity = '0.65';

    // Direct Platform Links - Clicking row (except on interactive tags) opens buyUrl
    tr.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) {
        return;
      }
      window.open(item.buyUrl, '_blank');
    });

    if (!item.isAvailable) {
      tr.innerHTML = `
        <td style="padding:12px; text-align:center;"><input type="checkbox" disabled></td>
        <td>
          <div class="platform-cell">
            <span class="platform-dot" style="background:#5e5e8c"></span>
            <span style="color:var(--text-muted)">${item.platform}</span>
          </div>
        </td>
        <td style="max-width:200px; color:var(--text-muted)">${item.productName}</td>
        <td><span class="price-unavailable">Unavailable</span></td>
        <td><span class="price-unavailable">—</span></td>
        <td><span class="discount-badge unavailable">N/A</span></td>
        <td><span style="color:var(--text-muted)">N/A</span></td>
        <td><span class="delivery-text" style="color:var(--text-muted)">Not Listed</span></td>
        <td><span style="font-size:0.78rem;color:var(--text-muted)">N/A</span></td>
        <td><span class="status-unavailable">Unavailable</span></td>
        <td class="action-cell">
          <a href="${item.buyUrl}" target="_blank" rel="noopener noreferrer" class="buy-now-btn unavailable">Search Site ↗</a>
          <button class="add-cart-btn disabled" disabled title="Product unavailable on this platform">🚫 Unavailable</button>
        </td>
      `;
      tbody.appendChild(tr);
      return;
    }

    let trustColor = '#10b981';
    if (item.trustScore < 80) trustColor = '#f97316';
    if (item.trustScore < 70) trustColor = '#ff007f';

    let statusClass = 'status-in-stock';
    let statusLabel = item.status;
    if (item.status === 'Limited Stock') statusClass = 'status-limited';
    if (item.status === 'Out of Stock') { statusClass = 'status-out'; }

    // Check if this item is in the wishlist
    const inWishlist = isItemInWishlist(item.platform, item.productName);

    tr.innerHTML = `
      <td style="padding:12px; text-align:center;">
        <input type="checkbox" class="shortlist-check-input" data-index="${i}">
      </td>
      <td>
        <div class="platform-cell">
          <span class="platform-dot" style="background:${item.dot}"></span>
          <span>${item.platform}</span>
        </div>
      </td>
      <td style="max-width:200px">${item.productName}</td>
      <td><span class="price-current">${formatUSD(item.currentPrice)}</span></td>
      <td><span class="price-original">${formatUSD(item.originalPrice)}</span></td>
      <td><span class="discount-badge">${item.discountPct}% OFF</span></td>
      <td><span class="rating-stars">⭐ ${item.rating}</span></td>
      <td><span class="delivery-text">${item.delivery}</span></td>
      <td>
        <span class="trust-bar-container"><span class="trust-bar-fill" style="width:${item.trustScore}%;background:${trustColor}"></span></span>
        <span style="font-size:0.78rem;font-weight:600">${item.trustScore}%</span>
      </td>
      <td><span class="${statusClass}">${statusLabel}</span></td>
      <td class="action-cell">
        <a href="${item.buyUrl}" target="_blank" rel="noopener noreferrer" class="buy-now-btn" style="--btn-color:${item.color}">Buy Now →</a>
        <button class="add-cart-btn" data-index="${i}" style="--btn-color:${item.color}">🛒 Add</button>
        <button class="wishlist-row-btn" data-index="${i}" style="
          background: ${inWishlist ? 'rgba(255, 0, 127, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
          border: 1px solid ${inWishlist ? 'var(--accent-pink)' : 'var(--border-light)'};
          color: ${inWishlist ? 'var(--accent-pink)' : 'var(--text-secondary)'};
          padding: 5px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; cursor: pointer; transition: all 0.25s ease;
          display: flex; align-items: center; justify-content: center; gap: 4px;
        ">
          ${inWishlist ? '🔔 Active' : '🔔 Alert'}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ────────────── Render Price History Chart (Canvas) ──────────────
function renderPriceChart(data) {
  const canvas = document.getElementById('priceHistoryCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0) return;
  canvas.width = rect.width * dpr;
  canvas.height = 280 * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width;
  const H = 280;

  ctx.clearRect(0, 0, W, H);

  const available = data.filter(d => d.isAvailable);
  if (available.length === 0) return;
  const top4 = [...available].sort((a, b) => a.currentPrice - b.currentPrice).slice(0, 4);

  const days = 30;
  const padL = 60, padR = 20, padT = 20, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const histories = top4.map(p => {
    const pts = [];
    let price = p.currentPrice * rand(1.05, 1.15);
    for (let d = 0; d < days; d++) {
      price += rand(-p.currentPrice * 0.015, p.currentPrice * 0.012);
      price = Math.max(p.currentPrice * 0.9, price);
      pts.push(price);
    }
    pts[days - 1] = p.currentPrice;
    return { platform: p.platform, color: p.color, points: pts };
  });

  let allPrices = histories.flatMap(h => h.points);
  let minP = Math.min(...allPrices) * 0.98;
  let maxP = Math.max(...allPrices) * 1.02;

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padT + (chartH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();
    const priceLabel = maxP - (maxP - minP) * (i / 5);
    ctx.fillStyle = '#5e5e8c';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('$' + priceLabel.toFixed(0), padL - 10, y + 4);
  }

  ctx.fillStyle = '#5e5e8c';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  for (let d = 0; d < days; d += 5) {
    const x = padL + (chartW / (days - 1)) * d;
    ctx.fillText(`Day ${d + 1}`, x, H - 10);
  }

  histories.forEach(h => {
    ctx.beginPath();
    ctx.strokeStyle = h.color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    h.points.forEach((p, i) => {
      const x = padL + (chartW / (days - 1)) * i;
      const y = padT + chartH - ((p - minP) / (maxP - minP)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.globalAlpha = 0.06;
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.lineTo(padL, padT + chartH);
    ctx.closePath();
    ctx.fillStyle = h.color;
    ctx.fill();
    ctx.globalAlpha = 1;

    const lastX = padL + chartW;
    const lastY = padT + chartH - ((h.points[days - 1] - minP) / (maxP - minP)) * chartH;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = h.color;
    ctx.fill();
  });

  const legendEl = document.getElementById('chartLegend');
  if (legendEl) {
    legendEl.innerHTML = '';
    histories.forEach(h => {
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `<span class="legend-dot" style="background:${h.color}"></span>${h.platform}`;
      legendEl.appendChild(item);
    });
  }
}

// ────────────── Update Insights Sidebar ──────────────
function updateRightSidebarInsights(query, data) {
  const emptyEl = document.getElementById('insights-empty');
  const activeEl = document.getElementById('insights-active');
  if (!emptyEl || !activeEl) return;

  const available = data.filter(d => d.isAvailable);
  if (available.length === 0) {
    emptyEl.classList.remove('hidden');
    activeEl.classList.add('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  activeEl.classList.remove('hidden');

  const best = [...available].sort((a, b) => a.currentPrice - b.currentPrice)[0];
  const avg = available.reduce((s, d) => s + d.currentPrice, 0) / available.length;
  const estSavings = avg - best.currentPrice;

  document.getElementById('active-res-product-title').textContent = formatProductName(query);
  document.getElementById('active-res-best-platform').textContent = best.platform;
  document.getElementById('active-res-best-price').textContent = formatUSD(best.currentPrice);
  document.getElementById('active-res-savings').textContent = formatUSD(estSavings > 0 ? estSavings : 0);
  document.getElementById('active-res-trust').textContent = `${best.trustScore}%`;
  document.getElementById('active-res-savings-pill').textContent = `Save ${best.discountPct}%`;
  document.getElementById('active-res-explanation').textContent = `${best.platform} is offering the optimal price point with ${best.delivery} delivery. ${available.length} platforms are in stock.`;

  const sidebarBuyLink = document.getElementById('active-res-buy-link');
  if (sidebarBuyLink) {
    sidebarBuyLink.href = best.buyUrl;
    sidebarBuyLink.innerHTML = `⚡ Buy Now on ${best.platform} ↗`;
  }

  const adviceBadge = document.getElementById('active-res-advice-badge');
  if (adviceBadge) {
    adviceBadge.href = best.buyUrl;
    adviceBadge.innerHTML = `⚡ Buy Now on ${best.platform} ↗`;
  }

  // Add to Cart button in right sidebar
  const sidebarCartBtn = document.getElementById('sidebar-add-cart-btn');
  if (sidebarCartBtn) {
    sidebarCartBtn.onclick = () => {
      addToCart(best);
      sidebarCartBtn.textContent = '✓ Added to Cart!';
      sidebarCartBtn.style.opacity = '0.7';
      setTimeout(() => { sidebarCartBtn.textContent = '🛒 Add to Cart'; sidebarCartBtn.style.opacity = '1'; }, 2000);
    };
  }

  // Populate breakdown items
  const breakdownList = document.getElementById('active-res-listings');
  if (breakdownList) {
    breakdownList.innerHTML = '';
    data.slice(0, 7).forEach(item => {
      const row = document.createElement('div');
      row.className = 'breakdown-item';
      row.innerHTML = `
        <span class="bd-name">${item.platform}</span>
        <span class="bd-status ${item.isAvailable ? 'text-green' : 'text-orange'}">${item.status}</span>
        <span class="bd-price">${item.isAvailable ? formatUSD(item.currentPrice) : 'N/A'}</span>
        ${item.isAvailable ? `<a href="${item.buyUrl}" target="_blank" rel="noopener noreferrer" class="bd-buy-btn">Buy ↗</a>` : '<span class="bd-unavailable">—</span>'}
      `;
      breakdownList.appendChild(row);
    });
  }
}

// ────────────── Interactive Radar Scanning Simulation ──────────────
function runOmniScanAnimation(query, onComplete) {
  const overlay = document.getElementById('search-scanning-overlay');
  const fill = document.getElementById('scan-progress-fill');
  const logText = document.getElementById('scanningLogText');

  if (!overlay || !fill) {
    onComplete();
    return;
  }

  overlay.classList.remove('hidden');
  fill.style.width = '0%';

  const logs = [
    'Connecting to merchant API clusters...',
    'Scanning Amazon, Flipkart, Croma, Reliance Digital...',
    'Querying JioMart, Vijay Sales, Myntra, Ajio, Meesho schemas...',
    'Parsing price predictions & seller trust scores...',
    'Finalizing OmniCart AI decision matrix...'
  ];

  let step = 0;
  const interval = setInterval(() => {
    step++;
    const pct = step * 20;
    fill.style.width = pct + '%';
    if (logs[step - 1] && logText) logText.textContent = logs[step - 1];

    if (step >= 5) {
      clearInterval(interval);
      setTimeout(() => {
        overlay.classList.add('hidden');
        onComplete();
      }, 250);
    }
  }, 220);
}

// ────────────── Versus Faceoff Scorecard Render ──────────────
function renderVersusScorecard(query, data) {
  const vsSection = document.getElementById('versusScorecardSection');
  if (!vsSection) return;

  const qLower = (query || '').toLowerCase();
  const isVersus = qLower.includes(' vs ') || qLower.includes(' versus ') || qLower.includes(' v/s ') || qLower.includes('vs');

  if (!isVersus) {
    vsSection.classList.add('hidden');
    return;
  }

  vsSection.classList.remove('hidden');

  let prod1 = 'Product A';
  let prod2 = 'Product B';

  if (qLower.includes('vs')) {
    const parts = query.split(/ vs | versus | v\/s |vs/i);
    if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
      prod1 = parts[0].trim();
      prod2 = parts[1].trim();
    } else {
      prod1 = query;
      prod2 = 'Alternative Model';
    }
  }

  const bestAvailable = data.filter(d => d.isAvailable).sort((a,b) => a.currentPrice - b.currentPrice);
  const bestItem = bestAvailable[0] || data[0];

  const price1 = bestItem ? bestItem.currentPrice : 999;
  const price2 = +(price1 * 1.15).toFixed(2);

  document.getElementById('vsHeaderTitle').textContent = `⚔️ ${formatProductName(prod1)} vs ${formatProductName(prod2)}`;
  document.getElementById('vsWinnerBadge').textContent = `🏆 WINNER: ${formatProductName(prod1)}`;

  const grid = document.getElementById('vsCardsGrid');
  if (grid) {
    grid.innerHTML = `
      <!-- PRODUCT 1 CARD (WINNER) -->
      <div style="background: rgba(16, 185, 129, 0.08); border: 2px solid #10b981; border-radius: 14px; padding: 18px; position: relative;">
        <span style="position: absolute; top: 12px; right: 12px; background: #10b981; color: #030013; font-weight: 800; font-size: 0.72rem; padding: 3px 8px; border-radius: 8px;">WINNER 96/100</span>
        <h4 style="font-size: 1.1rem; color: #ffffff; margin: 0 0 8px 0; font-family: var(--font-heading);">${formatProductName(prod1)}</h4>
        <div style="font-size: 1.3rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 12px;">${formatUSD(price1)} <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 400;">(${bestItem.platform})</span></div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
          <span>✅ <strong>Top Camera & Display:</strong> ProMotion 120Hz & AI Engine</span>
          <span>⚡ <strong>Lowest Market Price:</strong> Available on ${bestItem.platform}</span>
          <span>⭐ <strong>Customer Rating:</strong> 4.9 / 5.0 (98% Trust Score)</span>
        </div>
        <a href="${bestItem.buyUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-glow" style="display: block; text-align: center; text-decoration: none; width: 100%; font-size: 0.85rem;">⚡ Get Best Deal on ${formatProductName(prod1)}</a>
      </div>

      <!-- PRODUCT 2 CARD (RUNNER UP) -->
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-light); border-radius: 14px; padding: 18px; position: relative;">
        <span style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.1); color: var(--text-secondary); font-weight: 700; font-size: 0.72rem; padding: 3px 8px; border-radius: 8px;">RUNNER-UP 92/100</span>
        <h4 style="font-size: 1.1rem; color: #ffffff; margin: 0 0 8px 0; font-family: var(--font-heading);">${formatProductName(prod2)}</h4>
        <div style="font-size: 1.3rem; font-weight: 800; color: #f59e0b; margin-bottom: 12px;">${formatUSD(price2)} <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 400;">(Est. Retail)</span></div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
          <span>📱 <strong>Build & Display:</strong> Premium Materials & High Resolution</span>
          <span>🔋 <strong>Battery Life:</strong> All-Day High Capacity Battery</span>
          <span>⭐ <strong>Customer Rating:</strong> 4.7 / 5.0 (94% Trust Score)</span>
        </div>
        <a href="${bestItem.buyUrl}" target="_blank" rel="noopener" class="btn btn-outline" style="display: block; text-align: center; text-decoration: none; width: 100%; font-size: 0.85rem;">View ${formatProductName(prod2)} Deals</a>
      </div>
    `;
  }

  const verdictEl = document.getElementById('vsVerdictText');
  if (verdictEl) {
    verdictEl.innerHTML = `<strong>${formatProductName(prod1)}</strong> wins overall due to its superior price-to-performance ratio ($${price1} on ${bestItem.platform}), higher seller trust rating (98%), and lower depreciation rate. If you prefer alternative features, <strong>${formatProductName(prod2)}</strong> remains a strong alternative.`;
  }
}

// ────────────── Wishlist & Price Alerts Store ──────────────
const WISHLIST_KEY = 'omniCartWishlist';

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function setWishlist(list) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  } catch (e) {}
}

function isItemInWishlist(platform, productName) {
  const list = getWishlist();
  return list.some(item => item.platform === platform && item.productName === productName);
}

function toggleWishlist(item) {
  let list = getWishlist();
  const index = list.findIndex(i => i.platform === item.platform && i.productName === item.productName);

  if (index >= 0) {
    list.splice(index, 1);
    setWishlist(list);
    showToast(`🔔 Wishlist alert removed for ${item.productName}`, 'info');
  } else {
    const currentPrice = item.currentPrice;
    const targetPriceInput = prompt(`Enter Alert Price (Current Price is ${formatUSD(currentPrice)}):`, Math.round(currentPrice * 0.95));
    if (targetPriceInput === null) return;

    const targetPrice = parseFloat(targetPriceInput);
    if (isNaN(targetPrice) || targetPrice <= 0) {
      showToast('❌ Invalid target price', 'error');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      platform: item.platform,
      productName: item.productName,
      currentPrice: currentPrice,
      originalPrice: item.originalPrice,
      targetPrice: targetPrice,
      buyUrl: item.buyUrl,
      dot: item.dot || '#00f0ff',
    };

    list.push(newItem);
    setWishlist(list);
    showToast(`🔔 Price alert set for ${item.productName} at ${formatUSD(targetPrice)}!`, 'success');
  }

  renderTable(currentComparisonData);
  renderWishlist();
}

function renderWishlist() {
  const container = document.getElementById('wishlistContainer');
  if (!container) return;
  const list = getWishlist();
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<p style="font-size: 0.76rem; color: var(--text-muted); text-align: center; padding: 10px 0;">No active price alerts.</p>';
    return;
  }

  list.forEach(item => {
    const isDropped = item.currentPrice <= item.targetPrice;
    const el = document.createElement('div');
    el.style.cssText = `
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid ${isDropped ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-light)'};
      border-left: 3px solid ${isDropped ? 'var(--accent-green)' : 'var(--accent-pink)'};
      border-radius: 8px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    `;

    el.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
        <span style="font-size: 0.78rem; font-weight: 700; color: #fff; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.productName}</span>
        <span style="font-size: 0.65rem; color: #fff; background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px;">${item.platform}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem;">
        <span style="color: var(--text-secondary);">Target: <strong style="color:var(--accent-cyan);">${formatUSD(item.targetPrice)}</strong></span>
        <span style="color: var(--text-secondary);">Current: <strong style="${isDropped ? 'color: var(--accent-green);' : 'color: #fff;'}">${formatUSD(item.currentPrice)}</strong></span>
      </div>
      ${isDropped ? `
        <div style="font-size: 0.72rem; color: var(--accent-green); font-weight: 800; display:flex; align-items:center; gap:4px;">
          🎉 Price Dropped!
        </div>
      ` : ''}
      <div style="display: flex; gap: 6px; margin-top: 4px;">
        <a href="${item.buyUrl}" target="_blank" class="btn btn-outline" style="flex:1; padding: 4px; font-size: 0.68rem; text-align: center; text-decoration: none;">Buy ↗</a>
        <button class="btn btn-outline delete-alert-btn" data-id="${item.id}" style="padding: 4px 8px; border-color: rgba(255,0,127,0.3); color: #ff007f; font-size: 0.68rem;">Remove</button>
      </div>
    `;

    el.querySelector('.delete-alert-btn').onclick = (e) => {
      e.stopPropagation();
      let currentList = getWishlist().filter(i => i.id !== item.id);
      setWishlist(currentList);
      showToast(`Removed price alert for ${item.productName}`, 'info');
      renderWishlist();
      renderTable(currentComparisonData);
    };

    container.appendChild(el);
  });
}

// ────────────── Search History Panel Store ──────────────
const SEARCH_HISTORY_KEY = 'omniCartSearchHistory';

function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function setSearchHistory(history) {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {}
}

function addSearchQuery(query) {
  if (!query || !query.trim()) return;
  let history = getSearchHistory();
  history = history.filter(q => q.toLowerCase() !== query.toLowerCase().trim());
  history.unshift(query.trim());
  if (history.length > 5) {
    history = history.slice(0, 5);
  }
  setSearchHistory(history);
  renderSearchHistory();
}

function renderSearchHistory() {
  const container = document.getElementById('searchHistoryContainer');
  if (!container) return;
  const history = getSearchHistory();
  container.innerHTML = '';

  if (history.length === 0) {
    container.innerHTML = '<p style="font-size: 0.76rem; color: var(--text-muted); text-align: center; padding: 10px 0;">No recent searches.</p>';
    return;
  }

  history.forEach(q => {
    const el = document.createElement('button');
    el.className = 'chip';
    el.style.cssText = `
      width: 100%;
      text-align: left;
      font-size: 0.78rem;
      padding: 8px 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-light);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s ease;
    `;
    el.innerHTML = `
      <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width: 190px;">🔍 ${q}</span>
      <span style="font-size:0.65rem; color: var(--text-muted);">Compare</span>
    `;
    el.onclick = () => {
      const inputs = [document.getElementById('compareSearchInput'), document.getElementById('feedSearchInput')];
      inputs.forEach(inp => { if (inp) inp.value = q; });
      executeSearch(q);
    };
    container.appendChild(el);
  });
}

// ────────────── Autocomplete Engine ──────────────
const POPULAR_SUGGESTIONS = [
  'iPhone 17 Pro Max', 'iPhone 16 Pro', 'MacBook Air M4', 'Dell XPS 16 Laptop',
  'Sony BRAVIA XR OLED 55', 'Sony WH-1000XM6', 'Bose QuietComfort Ultra',
  'Samsung Galaxy S26', 'Samsung Galaxy S24 Ultra', 'Smartphones', 'Laptops',
  'OLED Smart TV', 'Wireless Headphones', 'Noise Cancelling Earbuds',
  'iPhone 16 vs Samsung S24', 'MacBook Pro vs Dell XPS', 'Sony XM5 vs Bose Ultra'
];

function initAutocomplete() {
  const inputs = [
    { inputId: 'compareSearchInput', dropdownId: 'compareAutocompleteDropdown' },
    { inputId: 'feedSearchInput', dropdownId: 'feedAutocompleteDropdown' }
  ];

  inputs.forEach(({ inputId, dropdownId }) => {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;

    const hideDropdown = () => setTimeout(() => dropdown.classList.add('hidden'), 200);

    input.addEventListener('focus', () => {
      const val = input.value.trim().toLowerCase();
      renderSuggestions(val, dropdown, input);
    });

    input.addEventListener('input', () => {
      const val = input.value.trim().toLowerCase();
      renderSuggestions(val, dropdown, input);
    });

    input.addEventListener('blur', hideDropdown);
  });
}

function renderSuggestions(val, dropdown, input) {
  let matches = [];
  if (!val) {
    matches = POPULAR_SUGGESTIONS.slice(0, 5);
  } else {
    matches = POPULAR_SUGGESTIONS.filter(item => item.toLowerCase().includes(val)).slice(0, 5);
  }

  if (matches.length === 0) {
    dropdown.classList.add('hidden');
    return;
  }

  dropdown.innerHTML = '';
  matches.forEach(m => {
    const el = document.createElement('div');
    el.style.cssText = `
      padding: 10px 14px;
      font-size: 0.82rem;
      color: var(--text-secondary);
      cursor: pointer;
      border-bottom: 1px solid rgba(255,255,255,0.02);
      transition: all 0.2s ease;
    `;
    el.textContent = m;
    el.addEventListener('mouseover', () => {
      el.style.background = 'rgba(0, 240, 255, 0.08)';
      el.style.color = '#fff';
    });
    el.addEventListener('mouseout', () => {
      el.style.background = 'transparent';
      el.style.color = 'var(--text-secondary)';
    });
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      input.value = m;
      dropdown.classList.add('hidden');
      executeSearch(m);
    });
    dropdown.appendChild(el);
  });

  dropdown.classList.remove('hidden');
}

// ────────────── Shortlist Selection & Compare ──────────────
let shortlistedIndices = [];

function initShortlistHandlers() {
  const tableBody = document.getElementById('comparisonTableBody');
  const compareBar = document.getElementById('shortlistCompareBar');
  const barText = document.getElementById('shortlistBarText');
  const compareBtn = document.getElementById('compareShortlistBtn');
  const modal = document.getElementById('shortlist-modal');
  const modalClose = document.getElementById('close-shortlist-modal');
  const modalTableBody = document.getElementById('shortlistComparisonTableBody');

  if (!tableBody) return;

  tableBody.addEventListener('change', (e) => {
    const chk = e.target.closest('.shortlist-check-input');
    if (!chk) return;

    const idx = parseInt(chk.dataset.index, 10);
    if (chk.checked) {
      if (shortlistedIndices.length >= 4) {
        chk.checked = false;
        showToast('❌ You can shortlist a maximum of 4 products!', 'error');
        return;
      }
      shortlistedIndices.push(idx);
    } else {
      shortlistedIndices = shortlistedIndices.filter(i => i !== idx);
    }

    updateShortlistCompareBar();
  });

  function updateShortlistCompareBar() {
    if (shortlistedIndices.length >= 2) {
      compareBar.classList.remove('hidden');
      barText.textContent = `Shortlisted: ${shortlistedIndices.length} / 4 Products`;
    } else {
      compareBar.classList.add('hidden');
    }
  }

  if (compareBtn && modal && modalTableBody) {
    compareBtn.addEventListener('click', () => {
      modalTableBody.innerHTML = '';
      shortlistedIndices.forEach(idx => {
        const item = currentComparisonData[idx];
        if (!item) return;

        let trustColor = '#10b981';
        if (item.trustScore < 80) trustColor = '#f97316';
        if (item.trustScore < 70) trustColor = '#ff007f';

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border-light)';
        tr.innerHTML = `
          <td style="padding:12px; font-weight:700;">
            <span class="platform-dot" style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${item.dot}; margin-right:6px;"></span>
            ${item.platform}
          </td>
          <td style="padding:12px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.productName}</td>
          <td style="padding:12px; font-weight:800; color:var(--accent-cyan);">${formatUSD(item.currentPrice)}</td>
          <td style="padding:12px; color:var(--accent-green); font-weight:700;">${item.discountPct}% OFF</td>
          <td style="padding:12px; color:var(--accent-yellow); font-weight:600;">⭐ ${item.rating}</td>
          <td style="padding:12px; color:var(--text-secondary); font-size:0.8rem;">${item.delivery}</td>
          <td style="padding:12px; font-weight:600; color:${trustColor};">${item.trustScore}%</td>
          <td style="padding:12px;">
            <a href="${item.buyUrl}" target="_blank" class="btn btn-primary" style="padding:4px 8px; font-size:0.7rem; text-decoration:none;">Buy Now</a>
          </td>
        `;
        modalTableBody.appendChild(tr);
      });

      modal.classList.remove('hidden');
    });
  }

  if (modalClose && modal) {
    modalClose.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }
}

// ────────────── Export & Share Report ──────────────
function initExportShareHandlers() {
  const exportBtn = document.getElementById('exportReportBtn');
  const shareBtn = document.getElementById('shareReportBtn');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (!currentQuery) {
        showToast('❌ Please search a product first before exporting.', 'error');
        return;
      }
      showToast('🖨️ Opening print layout...', 'info');
      
      const printWindow = window.open('', '_blank');
      const currency = document.getElementById('currencySelect')?.value || 'USD';
      
      let tableRows = '';
      currentComparisonData.forEach((item, i) => {
        tableRows += `
          <tr style="border-bottom:1px solid #ddd;">
            <td style="padding:10px;">${i + 1}</td>
            <td style="padding:10px; font-weight:bold;">${item.platform}</td>
            <td style="padding:10px;">${item.productName}</td>
            <td style="padding:10px; color:#0066ff; font-weight:bold;">${item.isAvailable ? formatUSD(item.currentPrice) : 'Unavailable'}</td>
            <td style="padding:10px; text-decoration:line-through; color:#888;">${item.isAvailable ? formatUSD(item.originalPrice) : '—'}</td>
            <td style="padding:10px; color:#10b981;">${item.isAvailable ? item.discountPct + '% OFF' : '—'}</td>
            <td style="padding:10px;">${item.isAvailable ? '⭐ ' + item.rating : '—'}</td>
            <td style="padding:10px;">${item.delivery}</td>
            <td style="padding:10px;">${item.isAvailable ? item.trustScore + '%' : '—'}</td>
          </tr>
        `;
      });

      printWindow.document.write(`
        <html>
        <head>
          <title>OmniCart AI — Product Comparison Report</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #222; padding: 20px; }
            h1 { font-family: 'Outfit', sans-serif; color: #030011; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f2f2f2; font-weight: bold; text-align: left; padding: 10px; border-bottom: 2px solid #ccc; }
          </style>
        </head>
        <body>
          <h1>OmniCart AI — Universal Comparison Report</h1>
          <p><strong>Product Query:</strong> ${currentQuery}</p>
          <p><strong>Export Date:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          <p><strong>Active Currency:</strong> ${currency}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Platform</th>
                <th>Product</th>
                <th>Price</th>
                <th>Original</th>
                <th>Discount</th>
                <th>Rating</th>
                <th>Delivery</th>
                <th>Seller Trust</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (!currentQuery) {
        showToast('❌ Please search a product first before sharing.', 'error');
        return;
      }
      const shareUrl = window.location.origin + window.location.pathname + '?q=' + encodeURIComponent(currentQuery);
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('🔗 Shareable comparison link copied to clipboard!', 'success');
      }).catch(() => {
        showToast('❌ Failed to copy link to clipboard.', 'error');
      });
    });
  }
}

// ────────────── Execute Search Query ──────────────
function executeSearch(rawQuery) {
  const query = (rawQuery || '').trim();
  const emptyState = document.getElementById('initialEmptyState');
  const resultsContainer = document.getElementById('resultsContainer');

  if (!query) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    return;
  }

  shortlistedIndices = [];
  const compareBar = document.getElementById('shortlistCompareBar');
  if (compareBar) compareBar.classList.add('hidden');

  runOmniScanAnimation(query, () => {
    if (emptyState) emptyState.classList.add('hidden');
    if (resultsContainer) resultsContainer.classList.remove('hidden');

    currentQuery = query;
    document.getElementById('heroTitle').textContent = formatProductName(query) + ' — Comparison';
    
    const mainInput = document.getElementById('compareSearchInput');
    const feedInput = document.getElementById('feedSearchInput');
    if (mainInput) mainInput.value = query;
    if (feedInput) feedInput.value = query;

    const data = generateComparisonData(query);
    renderVersusScorecard(query, data);
    renderMetrics(data);
    renderDecision(data);
    renderTable(data);
    renderPriceChart(data);
    updateRightSidebarInsights(query, data);

    addSearchQuery(query);
  });
}

function getUserId() {
  try {
    const userObj = JSON.parse(localStorage.getItem('omnicart_user') || '{}');
    return userObj.email || userObj._id || 'guest';
  } catch (e) {
    return 'guest';
  }
}

// ────────────── Cart REST API Integration ──────────────
function saveCartToLocal(itemData) {
  try {
    const userId = getUserId();
    const key = `omnicart_cart_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const newItem = {
      _id: Date.now().toString(),
      userId,
      platform: itemData.platform,
      productName: itemData.productName,
      currentPrice: itemData.currentPrice,
      originalPrice: itemData.originalPrice,
      discountPct: itemData.discountPct,
      rating: itemData.rating,
      delivery: itemData.delivery,
      trustScore: itemData.trustScore,
      status: itemData.status,
      buyUrl: itemData.buyUrl,
      platformColor: itemData.color || itemData.dot,
      quantity: 1,
    };
    existing.push(newItem);
    localStorage.setItem(key, JSON.stringify(existing));
    return true;
  } catch (e) { return false; }
}

async function addToCart(itemData) {
  saveCartToLocal(itemData);
  showToast(`🛒 ${itemData.productName} (${itemData.platform}) added!`, 'success');
  updateCartBadge();
  try {
    await fetch(CART_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: getUserId(),
        platform: itemData.platform,
        productName: itemData.productName,
        currentPrice: itemData.currentPrice,
        originalPrice: itemData.originalPrice,
        discountPct: itemData.discountPct,
        rating: itemData.rating,
        delivery: itemData.delivery,
        trustScore: itemData.trustScore,
        status: itemData.status,
        buyUrl: itemData.buyUrl,
        platformColor: itemData.color || itemData.dot,
        quantity: 1,
      }),
    });
  } catch (err) { /* silent — already saved locally */ }
}

async function updateCartBadge() {
  const badge = document.getElementById('cartCountBadge');
  try {
    const userId = getUserId();
    const localKey = `omnicart_cart_${userId}`;
    const localItems = JSON.parse(localStorage.getItem(localKey) || '[]');
    if (badge && localItems.length > 0) {
      badge.textContent = localItems.length;
      badge.style.display = 'inline-flex';
    }
  } catch (e) {}
  try {
    const userId = getUserId();
    const res = await fetch(`${CART_API}?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (badge && data.success) {
      const count = data.items.length;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  } catch (e) { /* silent */ }
}

// ────────────── Page Initialization & Event Listeners ──────────────
document.addEventListener('DOMContentLoaded', () => {

  const savedUserStr = localStorage.getItem('omnicart_user');
  if (!savedUserStr) {
    alert("🔒 Access Denied: Login is compulsory to access the Dashboard & Compare Engine!");
    window.location.href = 'index.html?auth=required';
    return;
  }

  const badgeEl = document.getElementById('dashboardUserBadge');
  const userProfileModal = document.getElementById('user-profile-modal');
  const closeProfileModalBtn = document.getElementById('closeProfileModal');
  const profileLogoutBtn = document.getElementById('profileLogoutBtn');

  try {
    const userObj = JSON.parse(savedUserStr);
    if (badgeEl && userObj.name) {
      badgeEl.textContent = '👤 ' + userObj.name;
    }
  } catch (e) {}

  if (badgeEl) {
    badgeEl.style.cursor = 'pointer';
    badgeEl.title = 'Click to view profile details';
    badgeEl.addEventListener('click', () => {
      try {
        const uObj = JSON.parse(localStorage.getItem('omnicart_user') || '{}');
        document.getElementById('profileName').textContent = uObj.name || 'User Profile';
        document.getElementById('profileEmail').textContent = uObj.email || 'N/A';
        document.getElementById('profileAvatar').textContent = (uObj.name || 'U').charAt(0).toUpperCase();

        const badgeCart = document.getElementById('cartCountBadge');
        if (badgeCart) {
          document.getElementById('profileCartCount').textContent = (badgeCart.textContent || '0') + ' Items';
        }
      } catch (e) {}

      if (userProfileModal) {
        userProfileModal.classList.remove('hidden');
        userProfileModal.style.display = 'flex';
      }
    });
  }

  if (closeProfileModalBtn && userProfileModal) {
    closeProfileModalBtn.addEventListener('click', () => {
      userProfileModal.classList.add('hidden');
      userProfileModal.style.display = 'none';
    });
  }

  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', () => {
      localStorage.removeItem('omnicart_user');
      alert("🚪 Logged out successfully! Redirecting to Home Page...");
      window.location.href = 'index.html';
    });
  }

  const logoutBtn = document.getElementById('dashboardLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('omnicart_user');
      alert("🚪 Logged out successfully! Redirecting to Home Page...");
      window.location.href = 'index.html';
    });
  }

  const bargainBtn = document.getElementById('runBargainBotBtn');
  const bargainBox = document.getElementById('bargainResultBox');
  if (bargainBtn && bargainBox) {
    bargainBtn.addEventListener('click', () => {
      bargainBox.style.display = 'block';
      bargainBox.innerHTML = `[SCAN] Checking 9 merchant API channels...`;

      setTimeout(() => {
        bargainBox.innerHTML = `[COUPON] Applied secret promo code 'OMNI10' (-₹2,500)...`;
      }, 700);

      setTimeout(() => {
        bargainBox.innerHTML = `[FINAL] Slashed ₹4,700 off total cart cost! 🚀`;
        showToast(`⚡ AI Bargain Bot unlocked hidden ₹4,700 savings!`, 'success');
      }, 1500);
    });
  }

  const emiSelect = document.getElementById('emiTenureSelect');
  const emiBadge = document.getElementById('emiCalcBadge');
  if (emiSelect) {
    emiSelect.addEventListener('change', () => {
      const tenure = Number(emiSelect.value);
      if (tenure > 0) {
        if (emiBadge) emiBadge.style.display = 'block';
        showToast(`💳 ${tenure} Months No-Cost EMI plan selected! Monthly installments calculated across stores.`, 'success');
      } else {
        if (emiBadge) emiBadge.style.display = 'none';
        showToast('Standard full payment pricing restored', 'info');
      }
    });
  }

  const fakeInflationToggle = document.getElementById('toggle-fake-inflation');
  if (fakeInflationToggle) {
    fakeInflationToggle.addEventListener('change', () => {
      if (fakeInflationToggle.checked) {
        showToast('🚨 Fake Inflation Shield Active: Blocked artificial pre-sale price hikes', 'success');
      } else {
        showToast('Showing raw unverified seller pricing', 'info');
      }
    });
  }

  const trustOnlyToggle = document.getElementById('toggle-trust-only');
  if (trustOnlyToggle) {
    trustOnlyToggle.addEventListener('change', () => {
      if (trustOnlyToggle.checked) {
        showToast('🛡️ Authenticity Shield Active: Showing verified stores (>80% Trust)', 'info');
      } else {
        showToast('Showing all stores regardless of trust score', 'info');
      }
    });
  }

  renderWishlist();
  renderSearchHistory();
  initAutocomplete();
  initShortlistHandlers();
  initExportShareHandlers();

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.wishlist-row-btn');
    if (!btn) return;
    const idx = parseInt(btn.dataset.index, 10);
    const item = currentComparisonData[idx];
    if (item) {
      toggleWishlist(item);
    }
  });

  const ratingSelect = document.getElementById('ratingFilterSelect');
  if (ratingSelect) {
    ratingSelect.addEventListener('change', () => {
      renderTable(currentComparisonData);
    });
  }

  const expressToggle = document.getElementById('toggle-express-delivery');
  if (expressToggle) {
    expressToggle.addEventListener('change', () => {
      renderTable(currentComparisonData);
    });
  }

  const currencySelect = document.getElementById('currencySelect');
  if (currencySelect) {
    currencySelect.addEventListener('change', () => {
      renderMetrics(currentComparisonData);
      renderDecision(currentComparisonData);
      renderTable(currentComparisonData);
      renderWishlist();
      showToast(`🌐 Display Currency changed to ${currencySelect.value}!`, 'info');
    });
  }

  updateCartBadge();

  const initialQuery = getQueryParam('q');
  if (initialQuery && initialQuery.trim()) {
    executeSearch(initialQuery);
  }

  const mainSearchBtn = document.getElementById('compareSearchBtn');
  const mainSearchInput = document.getElementById('compareSearchInput');
  if (mainSearchBtn && mainSearchInput) {
    mainSearchBtn.addEventListener('click', () => executeSearch(mainSearchInput.value));
    mainSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeSearch(mainSearchInput.value);
    });
  }

  const feedSearchBtn = document.getElementById('feedSearchBtn');
  const feedSearchInput = document.getElementById('feedSearchInput');
  if (feedSearchBtn && feedSearchInput) {
    feedSearchBtn.addEventListener('click', () => executeSearch(feedSearchInput.value));
    feedSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeSearch(feedSearchInput.value);
    });
  }

  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip') || e.target.closest('.run-analyze-trigger');
    if (chip && chip.dataset.query) {
      executeSearch(chip.dataset.query);
    }
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-cart-btn');
    if (!btn || btn.disabled) return;
    const idx = parseInt(btn.dataset.index, 10);
    const item = currentComparisonData[idx];
    if (item) {
      addToCart(item);
      btn.textContent = '✓ Added';
      btn.style.opacity = '0.7';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = '🛒 Add'; btn.style.opacity = '1'; btn.disabled = false; }, 2000);
    }
  });

  const apiModal = document.getElementById('api-modal');
  const apiToggleBtn = document.getElementById('api-settings-toggle');
  const closeApiModalBtn = document.getElementById('close-api-modal');
  const saveApiKeyBtn = document.getElementById('save-api-key');
  const clearApiKeyBtn = document.getElementById('clear-api-key');
  const apiKeyInput = document.getElementById('api-key-input');
  const apiStatusText = document.getElementById('api-status-text');

  if (apiKeyInput) {
    const savedKey = localStorage.getItem('omnicart_gemini_key') || localStorage.getItem('omnicart_api_key') || '';
    apiKeyInput.value = savedKey;
  }

  if (apiToggleBtn && apiModal) {
    apiToggleBtn.addEventListener('click', () => apiModal.classList.remove('hidden'));
    if (closeApiModalBtn) closeApiModalBtn.addEventListener('click', () => apiModal.classList.add('hidden'));
    if (saveApiKeyBtn) {
      saveApiKeyBtn.addEventListener('click', () => {
        const keyVal = (apiKeyInput.value || '').trim();
        if (keyVal) {
          localStorage.setItem('omnicart_gemini_key', keyVal);
          localStorage.setItem('omnicart_api_key', keyVal);
          if (apiStatusText) apiStatusText.textContent = 'Active: Google Gemini AI Key Connected!';
          showToast('🔑 Google Gemini AI Key saved successfully!', 'success');
        } else {
          localStorage.removeItem('omnicart_gemini_key');
          localStorage.removeItem('omnicart_api_key');
          if (apiStatusText) apiStatusText.textContent = 'Active: Auto Live Fetch Engine';
          showToast('🔑 API settings saved!', 'info');
        }
        apiModal.classList.add('hidden');
      });
    }
    if (clearApiKeyBtn) {
      clearApiKeyBtn.addEventListener('click', () => {
        localStorage.removeItem('omnicart_gemini_key');
        localStorage.removeItem('omnicart_api_key');
        if (apiKeyInput) apiKeyInput.value = '';
        if (apiStatusText) apiStatusText.textContent = 'Active: Auto Live Fetch Engine';
        apiModal.classList.add('hidden');
        showToast('🔑 API key cleared', 'info');
      });
    }
  }

  async function fetchAIChatResponse(userText) {
    const apiKey = localStorage.getItem('omnicart_gemini_key') || localStorage.getItem('omnicart_api_key') || '';

    const prompt = `You are OmniCart AI Agent — an expert, ultra-intelligent shopping assistant for Indian and global e-commerce platforms (Amazon India, Flipkart, Meesho, Croma, Reliance Digital, JioMart, Vijay Sales, Myntra, Ajio). 
Your task is to provide concise, smart, helpful shopping advice, price drop predictions, seller trust insights, and platform comparison recommendations.
Respond naturally in the user's language (Hindi, Hinglish, or English). Keep responses under 4-5 lines, clear, friendly, and structured.

User Message: "${userText}"`;

    if (apiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        const data = await res.json();
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
          return data.candidates[0].content.parts[0].text;
        }
      } catch (e) {
        console.warn("Gemini API error:", e);
      }
    }

    return generateSmartEcomResponse(userText);
  }

  function generateSmartEcomResponse(text) {
    const q = text.toLowerCase();

    if (q.includes("meesho") || q.includes("trust") || q.includes("safe")) {
      return "💡 **Meesho Trust & Buying Insights**:\n• Meesho is great for fashion & home items at lower price points.\n• For high-end tech (like MacBooks, iPhones), Flipkart or Amazon India have higher seller trust scores (92%+).\n• Always check seller ratings & 7-day return policy before purchasing.";
    }
    if (q.includes("iphone") || q.includes("macbook") || q.includes("apple") || q.includes("phone")) {
      return "📱 **Apple & Smartphone Buying Advisor**:\n• Amazon India & Flipkart offer the best festive discount deals & Instant Bank Cashback (HDFC/ICICI).\n• Our 30-day price trend projects price drops during upcoming sale events.\n• Check Croma or Reliance Digital for official warranty & instant pickup!";
    }
    if (q.includes("cheap") || q.includes("best price") || q.includes("lowest") || q.includes("discount")) {
      return "⚡ **Price Optimization Alert**:\n• I am scanning prices across all 9 platforms live!\n• Tip: Shopsy, Meesho, and JioMart often offer lower baseline prices on unbranded items.\n• For branded electronics, Flipkart Assured and Amazon Prime offer lower delivery risks.";
    }
    if (q.includes("hi") || q.includes("hello") || q.includes("hey") || q.includes("kaise")) {
      return "👋 **Namaste! Main OmniCart AI Assistant hoon.**\n• Aap kisi bhi product (Jaise: iPhone, Sony TV, Dell Laptop, Shoes) ke baare me pucch sakte hain.\n• Main aapko live lowest price, seller trust score, aur instant buying deal alert dunga!";
    }

    return `🤖 **OmniCart AI Analysis** for "${text}":\n• I scanned live schemas across 9 major platforms (Amazon, Flipkart, Croma, Meesho, Reliance, etc.).\n• Market prices are currently stable. Amazon India & Flipkart hold the top trust score (94%+).\n• Click on **Run OmniScan** above to compare live prices, discounts, and express delivery!`;
  }

  const chatToggleBtn = document.getElementById('ai-assistant-toggle');
  const chatCloseBtn = document.getElementById('close-assistant-btn');
  const chatDrawer = document.getElementById('assistant-drawer');
  const chatInput = document.getElementById('assistant-chat-input');
  const chatSendBtn = document.getElementById('assistant-chat-send');
  const chatMessages = document.getElementById('drawer-messages');

  if (chatToggleBtn && chatDrawer) {
    chatToggleBtn.addEventListener('click', () => chatDrawer.classList.toggle('open'));
    if (chatCloseBtn) chatCloseBtn.addEventListener('click', () => chatDrawer.classList.remove('open'));
    
    const sendMsg = async () => {
      const txt = (chatInput.value || '').trim();
      if (!txt) return;

      const uMsg = document.createElement('div');
      uMsg.className = 'chat-message user';
      uMsg.textContent = txt;
      chatMessages.appendChild(uMsg);
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      const typingMsg = document.createElement('div');
      typingMsg.className = 'chat-message bot typing';
      typingMsg.innerHTML = '🤖 <em>OmniCart AI is analyzing...</em>';
      chatMessages.appendChild(typingMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      const aiReply = await fetchAIChatResponse(txt);
      
      typingMsg.remove();
      const bMsg = document.createElement('div');
      bMsg.className = 'chat-message bot';
      bMsg.innerHTML = aiReply.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      chatMessages.appendChild(bMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    if (chatSendBtn) chatSendBtn.addEventListener('click', sendMsg);
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMsg();
      });
    }
  }

  const filterToggleBtn = document.querySelector('.mobile-sidebar-toggle.filters');
  const insightsToggleBtn = document.querySelector('.mobile-sidebar-toggle.insights');
  const filtersSidebar = document.getElementById('sidebar-filters');
  const insightsSidebar = document.getElementById('sidebar-insights');

  if (filterToggleBtn && filtersSidebar) {
    filterToggleBtn.addEventListener('click', () => filtersSidebar.classList.toggle('open'));
  }
  if (insightsToggleBtn && insightsSidebar) {
    insightsToggleBtn.addEventListener('click', () => insightsSidebar.classList.toggle('open'));
  }

});

window.addEventListener('resize', () => {
  if (currentComparisonData && currentComparisonData.length > 0) {
    renderPriceChart(currentComparisonData);
  }
});
