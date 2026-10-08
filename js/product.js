/* ============================================
   CampusCart - product.js
   Shows a single product's details and handles
   Add to Cart, Wishlist, and the Buy/Reserve ->
   confirm purchase -> generate order id flow.
   ============================================ */

const user = requireLogin();
setupHamburger();
updateNavCounts();

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const container = document.getElementById("product-container");

refreshProductStatuses();
let product = findProduct(productId);

if (!product) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="emoji">🔍</div>
      <h3>Item not found</h3>
      <p>This listing may have been removed.</p>
    </div>`;
} else {
  renderProduct();
}

function renderProduct() {
  const isSold = product.status === "sold";
  const isUpcoming = product.status === "upcoming";
  const isOwner = product.sellerRoll === user.rollNo;
  const inWishlist = isInWishlist(user.rollNo, product.id);
  const inCart = getCart(user.rollNo).includes(product.id);
  const others = countOtherCarts(product.id, user.rollNo);
  const cartNote = (!isSold && others > 0)
    ? `<p class="hint">🛒 ${others} other student${others > 1 ? "s have" : " has"} added this to cart</p>`
    : "";

  const overlay = isSold ? `<div class="overlay-sold"><span>Booked</span></div>` : "";

  const statusMeta = isSold
    ? `<span>🔒 Sold / Booked</span>`
    : isUpcoming
      ? `<span>📦 Available in ${daysLeft(product.availableDate)} day(s)</span>`
      : `<span>✅ Available now</span>`;

  const headsUpBlock = isUpcoming && product.headsUp
    ? `<div class="headsup">📢 Seller's note: ${product.headsUp}</div>`
    : "";

  const isBuyer = isSold && product.buyerRoll === user.rollNo;

  let actionButtons = "";
  if (isOwner) {
    actionButtons = `<p class="hint">This is your own listing${isSold ? " -- it has been booked by " + product.buyerName + " (Order ID: " + product.orderId + ")." : "."}</p>`
      + (isSold ? `<button class="btn btn-danger" id="cancel-order-btn">Cancel Order</button>` : "");
  } else if (isBuyer) {
    actionButtons = `<p class="hint">✅ You booked this item. Order ID: <strong>${product.orderId}</strong></p>
      <button class="btn btn-danger" id="cancel-order-btn">Cancel Order</button>`;
  } else if (isSold) {
    actionButtons = `<button class="btn btn-primary" disabled>Sold Out</button>`;
  } else {
    actionButtons = `
      ${inCart
        ? `<a href="cart.html" class="btn btn-secondary">✅ Added to Cart · View Cart</a>`
        : `<button class="btn btn-outline" id="cart-btn">🛒 Add to Cart</button>`}
      <button class="btn btn-outline" id="wish-btn">${inWishlist ? "❤️ Saved to Wishlist" : "🤍 Add to Wishlist"}</button>
      <button class="btn btn-primary" id="buy-btn">${isUpcoming ? "📌 Reserve Now" : "💳 Buy Now"}</button>
    `;
  }

  container.innerHTML = `
    <div class="product-detail">
      <div class="img-col">
        <img src="${product.image}" alt="${product.name}">
        ${overlay}
      </div>
      <div>
        <h1 class="pd-title">${product.name}</h1>
        <div class="pd-price">${formatMoney(product.price)}</div>
        <div class="pd-meta">
          <span>📂 ${product.category}</span>
          ${statusMeta}
        </div>
        ${headsUpBlock}
        <p class="pd-desc">${product.description}</p>
        <div class="pd-actions">${actionButtons}</div>
        ${cartNote}
        <div class="seller-box">
          👤 Sold by <strong>${product.sellerName}</strong> (${product.sellerRoll})<br>
          🗓️ Listed on ${formatDate(product.listedDate)}
        </div>
      </div>
    </div>
  `;

  if (!isOwner && !isSold) {
    const cartBtn = document.getElementById("cart-btn");
    if (cartBtn) {
      cartBtn.addEventListener("click", () => {
        addToCart(user.rollNo, product.id);
        showToast("Added to cart 🛒");
        updateNavCounts();
        renderProduct();
      });
    }
    document.getElementById("wish-btn").addEventListener("click", () => {
      const nowSaved = toggleWishlist(user.rollNo, product.id);
      showToast(nowSaved ? "Added to wishlist ❤️" : "Removed from wishlist");
      updateNavCounts();
      renderProduct();
    });
    document.getElementById("buy-btn").addEventListener("click", openConfirmModal);
  }

  const cancelBtn = document.getElementById("cancel-order-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", cancelCurrentOrder);
}

// ---------- cancel an order (buyer or seller) ----------
function cancelCurrentOrder() {
  if (!confirm("Cancel this order? The item will go back on sale.")) return;
  if (cancelOrder(product.id, user)) {
    document.getElementById("success-modal").classList.remove("open");
    product = findProduct(productId);
    renderProduct();
    showToast("Order cancelled -- item is available again ✅");
  } else {
    showToast("Could not cancel this order.");
  }
}

// ---------- purchase confirmation flow ----------
const confirmModal = document.getElementById("confirm-modal");
const successModal = document.getElementById("success-modal");

function openConfirmModal() {
  document.getElementById("confirm-text").textContent =
    `You're about to buy "${product.name}" for ${formatMoney(product.price)} from ${product.sellerName}.`;
  confirmModal.classList.add("open");
}
document.getElementById("cancel-buy").addEventListener("click", () => {
  confirmModal.classList.remove("open");
});
document.getElementById("confirm-buy").addEventListener("click", () => {
  const orderId = confirmPurchase(product.id, user);
  confirmModal.classList.remove("open");
  if (orderId) {
    removeFromCart(user.rollNo, product.id);
    product = findProduct(productId);   // reload so the page behind shows the booked state
    renderProduct();
    document.getElementById("order-id-display").textContent = orderId;
    successModal.classList.add("open");
    updateNavCounts();
  }
});

document.getElementById("modal-cancel-order").addEventListener("click", cancelCurrentOrder);