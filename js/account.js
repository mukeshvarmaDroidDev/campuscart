/* ============================================
   CampusCart - account.js
   "My Listings" = items this student is selling
   "My Purchases" = items this student has bought
   Both show the shared Order/Product ID once sold.
   ============================================ */

const user = requireLogin();
setupHamburger();
updateNavCounts();

document.getElementById("account-heading").textContent = "👤 " + user.name;
document.getElementById("account-sub").textContent = user.rollNo + " · " + user.email;

const tabButtons = document.querySelectorAll(".tab-btn");
const tabListings = document.getElementById("tab-listings");
const tabPurchases = document.getElementById("tab-purchases");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    if (btn.dataset.tab === "listings") {
      tabListings.style.display = "block";
      tabPurchases.style.display = "none";
    } else {
      tabListings.style.display = "none";
      tabPurchases.style.display = "block";
    }
  });
});

function statusTag(p) {
  if (p.status === "sold") return `<span class="status-tag status-sold">Booked / Sold</span>`;
  if (p.status === "upcoming") return `<span class="status-tag status-upcoming">Available in ${daysLeft(p.availableDate)}d</span>`;
  return `<span class="status-tag status-available">Available</span>`;
}

function renderListings() {
  refreshProductStatuses();
  const mine = getProducts().filter(p => p.sellerRoll === user.rollNo);

  if (mine.length === 0) {
    tabListings.innerHTML = `
      <div class="empty-state">
        <div class="emoji">📦</div>
        <h3>You haven't listed anything yet</h3>
        <p>Got something to sell? Let other REC students know!</p>
        <br><a href="sell.html" class="btn btn-primary">Sell an Item</a>
      </div>`;
    return;
  }

  tabListings.innerHTML = mine.map(p => `
    <div class="list-row">
      <img src="${p.image}" alt="${p.name}">
      <div class="info">
        <h4>${p.name}</h4>
        <div class="card-price">${formatMoney(p.price)}</div>
        ${statusTag(p)}
        ${p.status === "sold" ? `<div class="hint">Sold to ${p.buyerName} (${p.buyerRoll}) &middot; Order ID: <strong>${p.orderId}</strong></div>` : ""}
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <a href="product.html?id=${p.id}" class="btn btn-outline btn-sm">View</a>
        ${p.status === "sold" ? `<button class="btn btn-danger btn-sm cancel-btn" data-id="${p.id}">Cancel Order</button>` : ""}
      </div>
    </div>
  `).join("");
}

function renderPurchases() {
  refreshProductStatuses();
  const mine = getProducts().filter(p => p.buyerRoll === user.rollNo);

  if (mine.length === 0) {
    tabPurchases.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🛍️</div>
        <h3>No purchases yet</h3>
        <p>Items you buy on CampusCart will show up here with their Order ID.</p>
        <br><a href="home.html" class="btn btn-primary">Browse Items</a>
      </div>`;
    return;
  }

  tabPurchases.innerHTML = mine.map(p => `
    <div class="list-row">
      <img src="${p.image}" alt="${p.name}">
      <div class="info">
        <h4>${p.name}</h4>
        <div class="card-price">${formatMoney(p.price)}</div>
        <div class="hint">Bought from ${p.sellerName} (${p.sellerRoll}) &middot; Order ID: <strong>${p.orderId}</strong></div>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <a href="product.html?id=${p.id}" class="btn btn-outline btn-sm">View</a>
        <button class="btn btn-danger btn-sm cancel-btn" data-id="${p.id}">Cancel Order</button>
      </div>
    </div>
  `).join("");
}

// ---------- cancel order (works for both buyer and seller) ----------
function handleCancel(e) {
  const btn = e.target.closest(".cancel-btn");
  if (!btn) return;
  if (!confirm("Cancel this order? The item will go back on sale.")) return;
  if (cancelOrder(btn.getAttribute("data-id"), user)) {
    showToast("Order cancelled -- item is available again ✅");
    renderListings();
    renderPurchases();
  } else {
    showToast("Could not cancel this order.");
  }
}
tabListings.addEventListener("click", handleCancel);
tabPurchases.addEventListener("click", handleCancel);

renderListings();
renderPurchases();