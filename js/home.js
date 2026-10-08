/* ============================================
   CampusCart - home.js
   Renders the marketplace grid, handles search,
   category filter, sorting, cart & wishlist buttons.
   ============================================ */

const user = requireLogin();
setupHamburger();
updateNavCounts();

if (user) {
  document.getElementById("welcome-msg").textContent = "Welcome back, " + user.name.split(" ")[0] + "! 👋";
}

const grid = document.getElementById("product-grid");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortFilter = document.getElementById("sort-filter");

function buildCard(p) {
  const isSold = p.status === "sold";
  const isUpcoming = p.status === "upcoming";
  const inWishlist = isInWishlist(user.rollNo, p.id);

  const chip = isUpcoming
    ? `<div class="chip upcoming">📦 In ${daysLeft(p.availableDate)}d</div>`
    : "";
  // oh
  const overlay = isSold ? `<div class="overlay-sold"><span>Booked</span></div>` : "";

  const headsUp = isUpcoming && p.headsUp
    ? `<div class="headsup">📢 ${p.headsUp}</div>`
    : "";

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
      ${headsUp}
      <div class="card-actions">
        <a href="product.html?id=${p.id}" class="btn btn-outline btn-sm">View</a>
        ${!isSold ? `<button class="btn btn-sm wish-btn" data-id="${p.id}">${inWishlist ? "❤️ Saved" : "🤍 Save"}</button>` : ""}
      </div>
    </div>
  `;
  return card;
}

function render() {
  const products = refreshProductStatuses();
  const search = searchInput.value.trim().toLowerCase();
  const cat = categoryFilter.value;
  const sort = sortFilter.value;

  let list = products.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search);
    const matchesCat = cat === "all" || p.category === cat;
    return matchesSearch && matchesCat;
  });

  if (sort === "price-low") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-high") list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => b.listedDate - a.listedDate);

  grid.innerHTML = "";
  if (list.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    list.forEach(p => grid.appendChild(buildCard(p)));
  }

  // wishlist buttons
  document.querySelectorAll(".wish-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.getAttribute("data-id");
      const nowSaved = toggleWishlist(user.rollNo, id);
      showToast(nowSaved ? "Added to wishlist ❤️" : "Removed from wishlist");
      updateNavCounts();
      render();
    });
  });
}

searchInput.addEventListener("input", render);
categoryFilter.addEventListener("change", render);
sortFilter.addEventListener("change", render);

render();
