// searchHistory.js – Manages recent search queries
// Stores last 5 queries in localStorage under key 'omniCartSearchHistory'

const SEARCH_HISTORY_KEY = 'omniCartSearchHistory';
const MAX_HISTORY = 5;

/** Retrieve search history array */
function getSearchHistory() {
  const data = localStorage.getItem(SEARCH_HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

/** Save history array */
function setSearchHistory(arr) {
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(arr));
}

/** Add a new query to history */
function addSearchQuery(query) {
  if (!query) return;
  let history = getSearchHistory();
  history = history.filter(q => q !== query);
  history.unshift(query);
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  setSearchHistory(history);
  renderSearchHistory();
}

/** Render history list in the left sidebar */
function renderSearchHistory() {
  const container = document.getElementById('searchHistoryContainer');
  if (!container) return;
  const history = getSearchHistory();
  container.innerHTML = '';
  if (history.length === 0) {
    container.innerHTML = '<p class="history-empty">No recent searches.</p>';
    return;
  }
  const list = document.createElement('ul');
  list.className = 'search-history-list';
  history.forEach(q => {
    const li = document.createElement('li');
    li.className = 'search-history-item';
    const btn = document.createElement('button');
    btn.className = 'history-btn';
    btn.textContent = q;
    btn.onclick = () => {
      const query = q;
      const compareInput = document.getElementById('compareSearchInput');
      const feedInput = document.getElementById('feedSearchInput');
      if (compareInput) compareInput.value = query;
      if (feedInput) feedInput.value = query;
      const compareBtn = document.getElementById('compareSearchBtn');
      const feedBtn = document.getElementById('feedSearchBtn');
      if (compareBtn) {
        compareBtn.click();
      } else if (feedBtn) {
        feedBtn.click();
      }
    };
    li.appendChild(btn);
    list.appendChild(li);
  });
  container.appendChild(list);
}

window.searchHistory = {
  addSearchQuery,
  getSearchHistory,
  renderSearchHistory,
};
