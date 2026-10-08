/* ============================================
   CampusCart - cart.js
   ============================================ */

const user = requireLogin();
setupHamburger();
updateNavCounts();

const cartList = document.getElementById("cart-list");

function render() {
  refreshProductStatuses();
  const ids = getCart(user.rollNo);
  const products = ids.map(id => findProduct(id)).filter(Boolean);

  if (products.length === 0) {
    cartList.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Browse the marketplace and add items you'd like to buy.</p>
        <br><a href="home.html" class="btn btn-primary">Browse Items</a>
      </div>`;
    return;
  }

  cartList.innerHTML = "";
  products.forEach(p => {
    const row = document.createElement("div");
    row.className = "list-row";
    const sold = p.status === "sold";
    row.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="info">
        <h4>${p.name}</h4>
        <div class="card-price">${formatMoney(p.price)}</div>
        <span class="status-tag ${sold ? 'status-sold' : (p.status === 'upcoming' ? 'status-upcoming' : 'status-available')}">
          ${sold ? "Booked by someone else" : (p.status === "upcoming" ? "Available in " + daysLeft(p.availableDate) + "d" : "Available now")}
        </span>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <a href="product.html?id=${p.id}" class="btn btn-outline btn-sm">${sold ? "View" : "Go to Buy"}</a>
        <button class="btn btn-danger btn-sm remove-btn" data-id="${p.id}">Remove</button>
      </div>
    `;
    cartList.appendChild(row);
  });

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFromCart(user.rollNo, btn.getAttribute("data-id"));
      updateNavCounts();
      render();
    });
  });
}

render();
