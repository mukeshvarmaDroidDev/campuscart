/* ============================================
   CampusCart - sell.js
   Handles the "list an item" form, including
   image upload (converted to base64) and the
   "available in X days" heads-up option.
   ============================================ */

const user = requireLogin();
setupHamburger();
updateNavCounts();

let uploadedImage = "";

// toggle days/heads-up box based on radio choice
const availRadios = document.querySelectorAll('input[name="avail"]');
const daysBox = document.getElementById("days-box");
availRadios.forEach(r => {
  r.addEventListener("change", () => {
    daysBox.style.display = document.querySelector('input[name="avail"]:checked').value === "later" ? "block" : "none";
  });
});

// image upload -> preview + base64 for storage
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("image-preview");
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImage = e.target.result;
    imagePreview.innerHTML = `<img src="${uploadedImage}" alt="preview">`;
  };
  reader.readAsDataURL(file);
});

const sellForm = document.getElementById("sell-form");
sellForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("sell-error");
  errorEl.textContent = "";

  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const price = Number(document.getElementById("price").value);
  const category = document.getElementById("category").value;
  const availChoice = document.querySelector('input[name="avail"]:checked').value;
  const days = Number(document.getElementById("days").value);
  const headsUp = document.getElementById("headsup").value.trim();

  if (!name || !description || !price || !category) {
    errorEl.textContent = "Please fill in all the required fields.";
    return;
  }
  if (availChoice === "later" && (!days || days < 1 || days > 10)) {
    errorEl.textContent = "Please enter a heads-up window between 1 and 10 days.";
    return;
  }

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const isLater = availChoice === "later";

  const product = {
    id: "REC" + Math.floor(1000 + Math.random() * 8999) + Date.now().toString().slice(-3),
    sellerRoll: user.rollNo,
    sellerName: user.name,
    name,
    description,
    price,
    category,
    image: uploadedImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=60",
    listedDate: now,
    availableInDays: isLater ? days : 0,
    availableDate: isLater ? now + days * dayMs : now,
    headsUp: isLater ? headsUp : "",
    status: isLater ? "upcoming" : "available",
    buyerRoll: null,
    buyerName: null,
    orderId: null,
    soldDate: null
  };

  addProduct(product);
  showToast("Item listed successfully! 🎉");
  window.location.href = "product.html?id=" + product.id;
});
