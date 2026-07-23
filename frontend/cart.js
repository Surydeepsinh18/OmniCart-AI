/* ==========================================================================
   cart.js – Frontend Cart Management for OmniCart AI
   Talks to Express API at /api/cart
   Full CRUD: Load, Add, Update Quantity, Remove, Clear
   ========================================================================== */

const API_BASE = '/api/cart';

// ────────────── Utility ──────────────
function formatUSD(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function getUserId() {
  try {
    const u = JSON.parse(localStorage.getItem('omnicart_user') || '{}');
    return u.email || u._id || 'guest';
  } catch (e) {
    return 'guest';
  }
}

// ────────────── API Calls ──────────────
async function fetchCart() {
  try {
    const userId = getUserId();
    const res = await fetch(`${API_BASE}?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    return data.success ? data.items : [];
  } catch (err) {
    showToast('Failed to load cart. Is the server running?', 'error');
    return [];
  }
}

async function updateItemQty(id, quantity) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Quantity updated', 'info');
      loadCart();
    }
  } catch (err) {
    showToast('Update failed', 'error');
  }
}

async function removeItem(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Item removed from cart', 'success');
      loadCart();
    }
  } catch (err) {
    showToast('Remove failed', 'error');
  }
}

async function clearCart() {
  if (!confirm('Are you sure you want to clear your cart?')) return;
  try {
    const userId = getUserId();
    const res = await fetch(`${API_BASE}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Your cart has been cleared', 'success');
      loadCart();
    }
  } catch (err) {
    showToast('Clear failed', 'error');
  }
}

// ────────────── Render ──────────────
function renderCart(items) {
  const listEl = document.getElementById('cartItemsList');
  const emptyEl = document.getElementById('emptyState');
  const totalItemsEl = document.getElementById('totalItems');
  const totalQtyEl = document.getElementById('totalQty');
  const totalPriceEl = document.getElementById('totalPrice');
  const totalSavingsEl = document.getElementById('totalSavings');

  listEl.innerHTML = '';

  if (!items || items.length === 0) {
    emptyEl.classList.remove('hidden');
    totalItemsEl.textContent = '0';
    totalQtyEl.textContent = '0';
    totalPriceEl.textContent = '$0.00';
    totalSavingsEl.textContent = '$0.00';
    return;
  }

  emptyEl.classList.add('hidden');

  let grandTotal = 0;
  let grandSavings = 0;
  let totalQty = 0;

  items.forEach((item, idx) => {
    const lineTotal = item.currentPrice * item.quantity;
    const lineSavings = (item.originalPrice - item.currentPrice) * item.quantity;
    grandTotal += lineTotal;
    grandSavings += lineSavings;
    totalQty += item.quantity;

    const card = document.createElement('div');
    card.className = 'cart-item-card';
    card.style.animationDelay = `${idx * 0.06}s`;

    card.innerHTML = `
      <div class="cart-platform">
        <span class="cart-platform-dot" style="background:${item.platformColor || '#00f0ff'}"></span>
        <span>${item.platform}</span>
      </div>

      <div class="cart-product-info">
        <span class="cart-product-name">${item.productName}</span>
        <div class="cart-product-meta">
          <span>⭐ ${item.rating || 'N/A'}</span>
          <span>🚚 ${item.delivery || 'Standard'}</span>
          <span>🤝 ${item.trustScore || 0}% Trust</span>
        </div>
      </div>

      <div class="cart-price-block">
        <div class="cart-current-price">${formatUSD(item.currentPrice)}</div>
        <div class="cart-original-price">${formatUSD(item.originalPrice)}</div>
      </div>

      <div class="qty-controls">
        <button class="qty-btn" data-action="dec" data-id="${item._id}" data-qty="${item.quantity}">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn" data-action="inc" data-id="${item._id}" data-qty="${item.quantity}">+</button>
      </div>

      <div class="cart-line-total">${formatUSD(lineTotal)}</div>

      <div class="cart-item-actions">
        <a href="${item.buyUrl || '#'}" target="_blank" rel="noopener noreferrer" class="cart-action-btn cart-buy-btn">Buy →</a>
        <button class="cart-action-btn cart-remove-btn" data-remove-id="${item._id}">✕ Remove</button>
      </div>
    `;
    listEl.appendChild(card);
  });

  // Update summary
  totalItemsEl.textContent = items.length;
  totalQtyEl.textContent = totalQty;
  totalPriceEl.textContent = formatUSD(grandTotal);
  totalSavingsEl.textContent = formatUSD(grandSavings > 0 ? grandSavings : 0);
}

// ────────────── Event Delegation ──────────────
document.getElementById('cartItemsList').addEventListener('click', (e) => {
  // Quantity buttons
  const qtyBtn = e.target.closest('.qty-btn');
  if (qtyBtn) {
    const id = qtyBtn.dataset.id;
    const currentQty = parseInt(qtyBtn.dataset.qty, 10);
    const action = qtyBtn.dataset.action;
    const newQty = action === 'inc' ? currentQty + 1 : currentQty - 1;
    if (newQty < 1) {
      removeItem(id);
    } else {
      updateItemQty(id, newQty);
    }
    return;
  }

  // Remove button
  const removeBtn = e.target.closest('.cart-remove-btn');
  if (removeBtn) {
    removeItem(removeBtn.dataset.removeId);
    return;
  }
});

// Clear cart button
document.getElementById('clearCartBtn').addEventListener('click', clearCart);

// ────────────── Init ──────────────
async function loadCart() {
  const items = await fetchCart();
  renderCart(items);
}

window.addEventListener('DOMContentLoaded', loadCart);
