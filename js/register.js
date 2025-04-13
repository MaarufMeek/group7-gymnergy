// Class to manage user data, including registration, login, logout, and plan subscription
class User {
    // Constructor initializes a user object with basic properties and optional plan
    constructor(name, email, password, phone, plan = null) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.isLoggedIn = false;     // Indicates if the user is currently logged in
        this.hasRegistered = false;  // Indicates if the user has registered
        this.plan = plan;            // Stores the user's current subscription plan (if any)
    }

    // Retrieves the currently logged-in user from localStorage
    static getCurrentUser() {
        const email = localStorage.getItem("currentUser"); // Get the email of the currently logged-in user
        if (!email) return null;

        const data = localStorage.getItem(email); // Get the full user data using email as key
        if (!data) return null;

        const parsed = JSON.parse(data); // Parse the stored JSON data

        // Reconstruct and return a User instance with stored values
        const user = new User(parsed.name, parsed.email, parsed.password, parsed.phone, parsed.plan);
        user.isLoggedIn = parsed.isLoggedIn;
        user.hasRegistered = parsed.hasRegistered;
        return user;
    }

    // Checks if a user is currently logged in
    static isUserLoggedIn() {
        const user = User.getCurrentUser();
        return user && user.isLoggedIn;
    }

    // Saves the current user data to localStorage
    saveUser() {
        localStorage.setItem(this.email, JSON.stringify(this));
    }

    // Registers the user and saves their data
    registerUser() {
        this.hasRegistered = true;
        this.saveUser();
        alert("Registration successful!");
    }

    // Logs in the user by validating their credentials
    login(email, password) {
        if (this.email === email && this.password === password) {
            this.isLoggedIn = true;
            this.saveUser();
            localStorage.setItem("currentUser", this.email); // Store the logged-in user's email
            return true;
        }
        return false;
    }

    // Logs out the user and updates localStorage
    logout() {
        this.isLoggedIn = false;
        this.saveUser(); // Save the updated user state (logged out)
        localStorage.removeItem("currentUser"); // Remove the session indicator
    }

    // Updates the user's current plan and persists the change
    updatePlan(newPlan) {
        this.plan = newPlan;
        this.saveUser();
    }

    // Cancels the user's current plan and updates localStorage
    cancelPlan() {
        this.plan = null;
        this.saveUser();
    }
}


//----------------------------------------------------------------------------------------------------------------------

// Class to manage subscription plan
// Class to manage subscription plans and sync with the current user
class PlanManager {
    constructor() {
        // Available plans with names and prices
        this.plans = [
            {name: 'Bronze', price: 10},
            {name: 'Gold', price: 10},
            {name: 'Platinum', price: 10}
        ];

        // Get the currently logged-in user
        this.currentUser = User.getCurrentUser();

        // Set the current plan from user data or default to 'Free Plan'
        this.currentPlan = this.currentUser?.plan || 'Free Plan';

        // Get reference to the DOM element that shows the plan name
        this.planElementName = document.getElementById('plan-name');

        // Update UI on initialization
        this.updateUI();
    }

    // Updates the UI with the current plan name
    updateUI() {
        if (this.planElementName) {
            this.planElementName.textContent = this.currentPlan;
        }
    }

    // Handles selecting a plan
    selectPlan(planName) {
        // Check if plan name is valid (exists in available plans or is 'Free Trial')
        if (!this.plans.name.includes(planName) && planName !== 'Free Trial') {
            alert('Invalid plan selection');
            return;
        }

        // Set current plan
        this.currentPlan = planName;
        alert(`You have selected ${planName} plan`);

        // Update plan in the user object and save it
        if (this.currentUser) {
            this.currentUser.updatePlan(planName);
        }

        // Reflect changes in UI
        this.updateUI();
    }

    // Cancels the user's current plan
    cancelPlan() {
        if (confirm('You want to cancel your current plan?')) {
            this.currentPlan = 'No Plan';
        }

        // Cancel plan in user object
        if (this.currentUser) {
            this.currentUser.cancelPlan();
        }

        // Update UI accordingly
        this.updateUI();
    }

    // Upgrades to the next available plan
    upgradePlan() {
        // Find current plan index in plans array
        const index = this.plans.findIndex(plan => plan.name = this.currentPlan);

        // Check if already at highest plan or plan not found
        if (index === -1 || index === this.plans.length - 1) {
            alert('You are on the highest plan');
        } else {
            // Select the next higher plan
            const nextPlan = this.plans[index + 1];
            this.selectPlan(nextPlan.name);
        }
    }

    // Downgrades to the previous available plan
    downgradePlan() {
        // Find current plan index in plans array
        const index = this.plans.findIndex(plan => plan.name = this.currentPlan);

        // Check if already at lowest plan
        if(index <= 0) {
            alert('You are already on the lowest plan');
        } else {
            // Select the previous lower plan
            const prevPlan = this.plans[index - 1];
            this.selectPlan(prevPlan.name);
        }
    }
}

//----------------------------------------------------------------------------------------------------------------------


const authForm = document.getElementById("authForm");
const formTitle = document.getElementById("formTitle");
const toggleBtn = document.getElementById("toggle");
const submitBtn = document.getElementById("submitBtn");
const registerFields = document.getElementById("registerFields");

let isRegisterMode = false;

// Toggle between login and registration modes
if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
        isRegisterMode = !isRegisterMode;

        registerFields.style.display = isRegisterMode ? "block" : "none";
        formTitle.textContent = isRegisterMode ? "Register" : "Login";
        submitBtn.textContent = isRegisterMode ? "Create Account" : "Log In";
        toggleBtn.innerHTML = isRegisterMode ? "Back to Login" : "<i class=\"fa fa-user-plus\"></i> Register";
    });
}

// Unified form submission
if (authForm) {
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


            if (!name || !email || !phone || !password) {
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
            showToast(`Hey ${name}, welcome to Gymnergy`, 'success')
            toggleBtn.click();

        } else {
            const storedData = localStorage.getItem(email);
            if (!storedData) {
                showToast('User not found. Please register', 'info')
                return;
            }

            const user = Object.assign(new User(), JSON.parse(storedData));
            const success = user.login(email, password);

            if (success) {
                user.saveUser();
                window.location.href = "plan.html";
            } else {
                showToast('Incorrect password', 'error')
                alert("Incorrect password!");
            }
        }
    });
}


//logging out user
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const user = User.getCurrentUser();
        if (user) {
            user.logout();
            console.log('Logout successful');
            window.location.href = 'http://localhost:63342/grroup7/register.html';
        } else {
            alert('no user')
            console.warn('No user is currently logged in');
            window.location.href = 'http://localhost:63342/grroup7/register.html';
        }
    });
}


function showToast(message, type = "info") {
    const toastElement = document.getElementById("toast");
    const toastBody = toastElement.querySelector(".toast-body");

    toastBody.textContent = message;

    // Set the toast color based on alert type
    const toastHeader = toastElement.querySelector(".toast-header");
    if (type === "success") {
        toastHeader.classList.add("bg-success");
        toastHeader.classList.remove("bg-danger", "bg-warning");
    } else if (type === "error") {
        toastHeader.classList.add("bg-danger");
        toastHeader.classList.remove("bg-success", "bg-warning");
    } else {
        toastHeader.classList.add("bg-warning");
        toastHeader.classList.remove("bg-danger", "bg-success");
    }

    // Show the toast using Bootstrap's Toast API
    const toast = new Toast(toastElement, {
        delay: 2000,
    });
    toast.show();
}
    





