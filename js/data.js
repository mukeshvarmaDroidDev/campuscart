/* ============================================
   CampusCart - data.js
   Handles all localStorage "database" logic.
   No backend yet -- everything lives in the browser.
   ============================================ */

const COLLEGE_DOMAIN = "raghuenggcollege.in";

// ---------- small helpers ----------
function readJSON(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch (e) { return fallback; }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function formatMoney(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}
function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function daysLeft(availableDate) {
  const diff = availableDate - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
function showToast(msg) {
  let toast = document.getElementById("cc-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cc-toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ---------- college email validation ----------
// Only rollno@raghuenggcollege.in is allowed to sign up / log in.
function validateCollegeEmail(email, rollNo) {
  if (!email || !rollNo) return false;
  const pattern = new RegExp("^" + rollNo.trim().toLowerCase() + "@" + COLLEGE_DOMAIN.replace(".", "\\.") + "$");
  return pattern.test(email.trim().toLowerCase());
}
function suggestEmail(rollNo) {
  if (!rollNo) return "";
  return rollNo.trim().toLowerCase() + "@" + COLLEGE_DOMAIN;
}

// ---------- users ----------
function getUsers() { return readJSON("cc_users", []); }
function saveUsers(users) { writeJSON("cc_users", users); }
function findUserByRoll(rollNo) {
  return getUsers().find(u => u.rollNo.toLowerCase() === rollNo.trim().toLowerCase());
}

// ---------- session ----------
function getCurrentUser() {
  const roll = localStorage.getItem("cc_currentUser");
  if (!roll) return null;
  return findUserByRoll(roll) || null;
}
function setCurrentUser(rollNo) { localStorage.setItem("cc_currentUser", rollNo); }
function logout() {
  localStorage.removeItem("cc_currentUser");
  window.location.href = "index.html";
}
// call this at the top of every protected page
function requireLogin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return null;
  }
  return user;
}

// ---------- order id counter ----------
function nextOrderId() {
  let counter = Number(localStorage.getItem("cc_counter") || "1000");
  counter += 1;
  localStorage.setItem("cc_counter", String(counter));
  return "REC" + counter;
}

// ---------- products ----------
function getProducts() { return readJSON("cc_products", []); }
function saveProducts(products) { writeJSON("cc_products", products); }
function findProduct(id) { return getProducts().find(p => p.id === id); }

// flips "upcoming" -> "available" once the heads-up window has passed
function refreshProductStatuses() {
  const products = getProducts();
  let changed = false;
  products.forEach(p => {
    if (p.status === "upcoming" && Date.now() >= p.availableDate) {
      p.status = "available";
      changed = true;
    }
  });
  if (changed) saveProducts(products);
  return products;
}

function addProduct(product) { 
  const products = getProducts();
  products.unshift(product);
  saveProducts(products);
}

// buyer confirms purchase -> generate one order id for both sides
function confirmPurchase(productId, buyer) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product || product.status === "sold") return null;
  const orderId = nextOrderId();
  product.status = "sold";
  product.buyerRoll = buyer.rollNo;
  product.buyerName = buyer.name;
  product.orderId = orderId;
  product.soldDate = Date.now();
  saveProducts(products);
  return orderId;
}

// cancel a booking -- buyer OR seller can do it, item goes back on sale
function cancelOrder(productId, user) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product || product.status !== "sold") return false;
  if (product.buyerRoll !== user.rollNo && product.sellerRoll !== user.rollNo) return false;
  // heads-up items whose date hasn't arrived yet go back to "upcoming"
  product.status = Date.now() < product.availableDate ? "upcoming" : "available";
  product.buyerRoll = null;
  product.buyerName = null;
  product.orderId = null;
  product.soldDate = null;
  saveProducts(products);
  return true;
}

// ---------- cart ----------
function getCart(rollNo) { return readJSON("cc_cart_" + rollNo, []); }
function saveCart(rollNo, ids) { writeJSON("cc_cart_" + rollNo, ids); }
function addToCart(rollNo, productId) {
  const cart = getCart(rollNo);
  if (!cart.includes(productId)) cart.push(productId);
  saveCart(rollNo, cart);
}
function removeFromCart(rollNo, productId) {
  saveCart(rollNo, getCart(rollNo).filter(id => id !== productId));
}

// how many OTHER students (accounts used on this browser) have this item in their cart
function countOtherCarts(productId, myRoll) {
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("cc_cart_") && key !== "cc_cart_" + myRoll) {
      if (readJSON(key, []).includes(productId)) count++;
    }
  }
  return count;
}

// ---------- wishlist ----------
function getWishlist(rollNo) { return readJSON("cc_wishlist_" + rollNo, []); }
function saveWishlist(rollNo, ids) { writeJSON("cc_wishlist_" + rollNo, ids); }
function isInWishlist(rollNo, productId) { return getWishlist(rollNo).includes(productId); }
function toggleWishlist(rollNo, productId) {
  let list = getWishlist(rollNo);
  if (list.includes(productId)) {
    list = list.filter(id => id !== productId);
  } else {
    list.push(productId);
  }
  saveWishlist(rollNo, list);
  return list.includes(productId);
}

// ---------- nav badge counts (used on every page) ----------
function updateNavCounts() {
  const user = getCurrentUser();
  if (!user) return;
  const cartCountEl = document.getElementById("cart-count");
  const wishCountEl = document.getElementById("wish-count");
  if (cartCountEl) cartCountEl.textContent = getCart(user.rollNo).length;
  if (wishCountEl) wishCountEl.textContent = getWishlist(user.rollNo).length;
  const nameEl = document.getElementById("nav-username");
  if (nameEl) nameEl.textContent = user.name.split(" ")[0];
}

// hamburger toggle - shared across pages
function setupHamburger() {
  const burger = document.getElementById("hamburger");
  const links = document.getElementById("nav-links");
  if (burger && links) {
    burger.addEventListener("click", () => links.classList.toggle("open"));
  }
}

// ---------- seed demo data (only runs once) ----------
function seedDataIfEmpty() {
  if (getUsers().length === 0) {
    saveUsers([
      {
        rollNo: "20951A0501",
        name: "Demo Student",
        email: "20951a0501@raghuenggcollege.in",
        password: "demo123"
      }
    ]);
  }

  if (getProducts().length === 0) {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const demo = [
      {
        id: "REC1001",
        sellerRoll: "20951A0512",
        sellerName: "Priya Sharma",
        name: "Engineering Mathematics - II Textbook",
        description: "B.Tech 1st year maths textbook, all chapters solved with notes in the margins. Barely any highlighting, very usable condition.",
        price: 180,
        category: "Textbooks",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=60",
        listedDate: now - 2 * day,
        availableInDays: 0,
        availableDate: now - 2 * day,
        headsUp: "",
        status: "available",
        buyerRoll: null, buyerName: null, orderId: null, soldDate: null
      },
      {
        id: "REC1002",
        sellerRoll: "21951A0433",
        sellerName: "Karthik Rao",
        name: "Casio fx-991ES Scientific Calculator",
        description: "Used for 2 semesters, works perfectly, all buttons responsive. Comes with the original cover.",
        price: 450,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=500&q=60",
        listedDate: now - 5 * day,
        availableInDays: 0,
        availableDate: now - 5 * day,
        headsUp: "",
        status: "available",
        buyerRoll: null, buyerName: null, orderId: null, soldDate: null
      },
      {
        id: "REC1003",
        sellerRoll: "20951A0501",
        sellerName: "Demo Student",
        name: "Hero Sprint Bicycle",
        description: "Single-speed cycle, great for getting around campus and to the hostel. New tyres fitted last month.",
        price: 2200,
        category: "Vehicles",
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&q=60",
        listedDate: now - 1 * day,
        availableInDays: 0,
        availableDate: now - 1 * day,
        headsUp: "",
        status: "available",
        buyerRoll: null, buyerName: null, orderId: null, soldDate: null
      },
      {
        id: "REC1004",
        sellerRoll: "22951A0567",
        sellerName: "Ananya Reddy",
        name: "Drafting Kit (Full Set)",
        description: "Complete drafting kit for 1st year engineering graphics -- compass, scales, set squares, all included.",
        price: 220,
        category: "Stationery",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&q=60",
        listedDate: now,
        availableInDays: 5,
        availableDate: now + 5 * day,
        headsUp: "Still using it for my final submissions -- will hand it over right after my practicals get over!",
        status: "upcoming",
        buyerRoll: null, buyerName: null, orderId: null, soldDate: null
      },
      {
        id: "REC1005",
        sellerRoll: "21951A0489",
        sellerName: "Mohammed Farhan",
        name: "Boat Rockerz Bluetooth Headphones",
        description: "Lightly used, battery backup is still great (~7 hrs). Selling because I upgraded to earbuds.",
        price: 700,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=60",
        listedDate: now - 3 * day,
        availableInDays: 0,
        availableDate: now - 3 * day,
        headsUp: "",
        status: "available",
        buyerRoll: null, buyerName: null, orderId: null, soldDate: null
      },
      {
        id: "REC1006",
        sellerRoll: "20951A0544",
        sellerName: "Sai Teja",
        name: "Hostel Study Lamp",
        description: "Adjustable-neck LED table lamp, 3 brightness modes. Perfect for late-night hostel study sessions.",
        price: 300,
        category: "Hostel Essentials",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=60",
        listedDate: now - 8 * day,
        availableInDays: 0,
        availableDate: now - 8 * day,
        headsUp: "",
        status: "sold",
        buyerRoll: "20951A0501",
        buyerName: "Demo Student",
        orderId: "REC1050",
        soldDate: now - 1 * day
      },
      {
        id: "REC1007",
        sellerRoll: "22951A0512",
        sellerName: "Divya Sri",
        name: "Badminton Racket (Yonex)",
        description: "Good grip, light frame, ideal for casual campus games. Selling with one shuttlecock included.",
        price: 350,
        category: "Sports",
        image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&q=60",
        listedDate: now,
        availableInDays: 3,
        availableDate: now + 3 * day,
        headsUp: "Tournament ends in 3 days, will hand over right after!",
        status: "upcoming",
        buyerRoll: null, buyerName: null, orderId: null, soldDate: null
      }
    ];
    saveProducts(demo);
    localStorage.setItem("cc_counter", "1050");
  }
}

seedDataIfEmpty();