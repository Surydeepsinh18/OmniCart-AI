// wishlist.js – Manages Wishlist functionality
// Uses localStorage to persist wishlist items { id, productName, platform, currentPrice, originalPrice, buyUrl }

const WISHLIST_KEY = 'omniCartWishlist';

/** Get the wishlist array from localStorage */
function getWishlist() {
  const data = localStorage.getItem(WISHLIST_KEY);
  return data ? JSON.parse(data) : [];
}

/** Save wishlist array to localStorage */
function setWishlist(list) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
}

/** Add a product to wishlist */
function addToWishlist(item) {
  const list = getWishlist();
  if (!list.find(i => i.id === item.id)) {
    list.push(item);
    setWishlist(list);
    showToast('Added to Wishlist', 'success');
  } else {
    showToast('Already in Wishlist', 'info');
  }
}

/** Remove a product from wishlist */
function removeFromWishlist(id) {
  const list = getWishlist().filter(i => i.id !== id);
  setWishlist(list);
  renderWishlist();
}

/** Check for price drops – compare stored price with current price fetched via DOM */
function checkPriceDrops() {
  const list = getWishlist();
  const updated = list.map(item => {
    const match = (window.currentComparisonData || []).find(p => p.id === item.id);
    if (match && match.currentPrice < item.currentPrice) {
      item.priceDropped = true;
      item.currentPrice = match.currentPrice;
    } else {
      item.priceDropped = false;
    }
    return item;
  });
  setWishlist(updated);
}

/** Render wishlist on wishlist.html */
function renderWishlist() {
  const container = document.getElementById('wishlistContainer');
  if (!container) return;
  const list = getWishlist();
  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = '<p>No items in your Wishlist.</p>';
    return;
  }
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'wishlist-card';
    const badge = item.priceDropped ? '<span class="price-drop-badge">Price Drop!</span>' : '';
    card.innerHTML = `
      <div class="card-header">
        ${badge}
        <h4>${item.productName}</h4>
        <p>${item.platform}</p>
      </div>
      <div class="card-body">
        <p>Current: $${item.currentPrice.toFixed(2)}</p>
        <p>Original: $${item.originalPrice.toFixed(2)}</p>
        <a href="${item.buyUrl}" target="_blank" class="btn btn-primary">Buy</a>
        <button class="btn btn-outline" onclick="removeFromWishlist('${item.id}')">Remove</button>
      </div>`;
    container.appendChild(card);
  });
}

window.wishlist = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  renderWishlist,
  checkPriceDrops,
};
