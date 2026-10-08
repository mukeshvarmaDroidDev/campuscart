/* ============================================
   CampusCart - wishlist.js
   ============================================ */

const user = requireLogin();
setupHamburger();
updateNavCounts();

const grid = document.getElementById("wishlist-grid");
const emptyState = document.getElementById("empty-state");

function buildCard(p) {
  const isSold = p.status === "sold";
  const isUpcoming = p.status === "upcoming";
  const overlay = isSold ? `<div class="overlay-sold"><span>Booked</span></div>` : "";
  const chip = isUpcoming ? `<div class="chip upcoming">📦 In ${daysLeft(p.availableDate)}d</div>` : "";

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <a href="product.html?id=${p.id}">
      <div class="card-img-wrap">
        <img src="${p.image}" alt="${p.name}">
        ${chip}
        ${overlay}
      </div>
    </a>
    <div class="card-body">
      <div class="card-cat">${p.category}</div>
      <a href="product.html?id=${p.id}"><h3>${p.name}</h3></a>
      <div class="card-price">${formatMoney(p.price)}</div>
      <div class="card-seller">Seller: ${p.sellerName}</div>
      <div class="card-actions">
        <a href="product.html?id=${p.id}" class="btn btn-outline btn-sm">View</a>
        <button class="btn btn-danger btn-sm remove-btn" data-id="${p.id}">Remove</button>
      </div>
    </div>
  `;
  return card;
}

function render() {
  refreshProductStatuses();
  const ids = getWishlist(user.rollNo);
  const products = ids.map(id => findProduct(id)).filter(Boolean);

  grid.innerHTML = "";
  if (products.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    products.forEach(p => grid.appendChild(buildCard(p)));
  }

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      toggleWishlist(user.rollNo, btn.getAttribute("data-id"));
      updateNavCounts();
      render();
    });
  });
}

render();
