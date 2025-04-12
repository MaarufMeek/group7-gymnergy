class User {
  constructor(name, email, password, phone) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.isLoggedIn = false;
    this.hasRegistered = false;
  }

  saveUser () {
      localStorage.setItem(this.email, JSON.stringify(this));
  }

  registerUser() {
      this.hasRegistered = true;
    this.saveUser();
    alert("Registration successful!");
  }

  login(email, password) {
    if (this.email === email && this.password === password) {
      this.isLoggedIn = true;
      this.saveUser();
      localStorage.setItem("currentUser", this.email);
      return true;
    }
    return false;
  }

  logout() {
    this.isLoggedIn = false;
    this.saveUser() // persist logout status
    localStorage.removeItem("currentUser");
  }

  updatePlan(newPlan) {
    this.plan = newPlan;
    this.saveUser();
  }

  cancelPlan() {
    this.plan = null;
    this.saveUser();
  }

  static getCurrentUser() {
    const email = localStorage.getItem("currentUser");
    if (!email) return null;

    const data = localStorage.getItem(email);
    return data ? Object.assign(new User(), JSON.parse(data)) : null;
  }

  static isUserLoggedIn() {
    const user = User.getCurrentUser();
    return user && user.isLoggedIn;
  }
}

const authForm = document.getElementById("authForm");
const formTitle = document.getElementById("formTitle");
const toggleBtn = document.getElementById("toggle");
const submitBtn = document.getElementById("submitBtn");
const registerFields = document.getElementById("registerFields");

let isRegisterMode = false;

// Toggle between login and registration modes
toggleBtn.addEventListener("click", () => {
  isRegisterMode = !isRegisterMode;

  registerFields.style.display = isRegisterMode ? "block" : "none";
  formTitle.textContent = isRegisterMode ? "Register" : "Login";
  submitBtn.textContent = isRegisterMode ? "Create Account" : "Log In";
  toggleBtn.textContent = isRegisterMode ? "Back to Login" : "Register Instead";
});

// Unified form submission
authForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill out all required fields.");
    return;
  }

  if (isRegisterMode) {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();


    if (!name || ! email || !phone || !password) {
      alert("Please complete all registration fields.");
      return;
    }

    if (localStorage.getItem(email)) {
      alert("User already registered. Please log in.");
      isRegisterMode = false;
      toggleBtn.click();
      return;
    }

    const newUser = new User(name, email, password, phone);
    newUser.registerUser();
    authForm.reset();
    isRegisterMode = false;
    alert("Hey" + name + "welcome to Gymnergy!")
    toggleBtn.click();

  } else {
    const storedData = localStorage.getItem(email);
    if (!storedData) {
      alert("User not found. Please register.");
      return;
    }

    const user = Object.assign(new User(), JSON.parse(storedData));
    const success = user.login(email, password);

    if (success) {
      alert("Login successful!");
      window.location.href = "plans.html";
    } else {
      alert("Incorrect password!");
    }
  }
});
