/* ============================================
   CampusCart - auth.js
   Handles login + signup form logic.
   ============================================ */

// auto-fill email suggestion on signup as roll no is typed
const rollInput = document.getElementById("rollNo");
const emailInput = document.getElementById("email");
if (rollInput && emailInput && document.getElementById("signup-form")) {
  rollInput.addEventListener("input", () => {
    emailInput.value = suggestEmail(rollInput.value);
  });
}

// ---------- LOGIN ----------
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const rollNo = document.getElementById("rollNo").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const errorEl = document.getElementById("login-error");
    errorEl.textContent = "";

    if (!validateCollegeEmail(email, rollNo)) {
      errorEl.textContent = "Please use your official college email: rollno@raghuenggcollege.in";
      return;
    }

    const user = findUserByRoll(rollNo);
    if (!user) {
      errorEl.textContent = "No account found for this roll number. Please sign up first.";
      return;
    }
    if (user.email.toLowerCase() !== email.toLowerCase() || user.password !== password) {
      errorEl.textContent = "Incorrect email or password.";
      return;
    }

    setCurrentUser(user.rollNo);
    window.location.href = "home.html";
  });
}

// ---------- SIGN UP ----------
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const rollNo = document.getElementById("rollNo").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const errorEl = document.getElementById("signup-error");
    errorEl.textContent = "";

    if (!validateCollegeEmail(email, rollNo)) {
      errorEl.textContent = "Email must match your roll number, e.g. " + suggestEmail(rollNo || "rollno");
      return;
    }
    if (findUserByRoll(rollNo)) {
      errorEl.textContent = "An account with this roll number already exists. Please login instead.";
      return;
    }
    if (password.length < 4) {
      errorEl.textContent = "Password should be at least 4 characters.";
      return;
    }

    const users = getUsers();
    users.push({ rollNo, name, email: email.toLowerCase(), password });
    saveUsers(users);

    setCurrentUser(rollNo);
    window.location.href = "home.html";
  });
}
