// Class to manage cur_user data, including registration, login, logout, and plan subscription
class User {
    // Constructor initializes a cur_user object with basic properties and optional plan
    constructor(name, email, password, phone, plan = null) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.isLoggedIn = false;     // Indicates if the cur_user is currently logged in
        this.hasRegistered = false;  // Indicates if the cur_user has registered
        this.plan = plan;            // Stores the cur_user's current subscription plan (if any)
    }

    // Retrieves the currently logged-in cur_user from localStorage
    static getCurrentUser() {
        const email = localStorage.getItem("currentUser"); // Get the email of the currently logged-in cur_user
        if (!email) return null;

        const data = localStorage.getItem(email); // Get the full cur_user data using email as key
        if (!data) return null;

        const parsed = JSON.parse(data); // Parse the stored JSON data

        // Reconstruct and return a User instance with stored values
        const user = new User(parsed.name, parsed.email, parsed.password, parsed.phone, parsed.plan);
        user.isLoggedIn = parsed.isLoggedIn;
        user.hasRegistered = parsed.hasRegistered;
        return user;
    }

    // Checks if a cur_user is currently logged in
    static isUserLoggedIn() {
        const user = User.getCurrentUser();
        return user && user.isLoggedIn;
    }

    // Saves the current cur_user data to localStorage
    saveUser() {
        localStorage.setItem(this.email, JSON.stringify(this));
    }

    // Registers the cur_user and saves their data
    registerUser() {
        this.hasRegistered = true;
        this.saveUser();
        alert("Registration successful!");
    }

    // Logs in the cur_user by validating their credentials
    login(email, password) {
        if (this.email === email && this.password === password) {
            this.isLoggedIn = true;
            this.saveUser();
            localStorage.setItem("currentUser", this.email); // Store the logged-in cur_user's email
            return true;
        }
        return false;
    }

    // Logs out the cur_user and updates localStorage
    logout() {
        this.isLoggedIn = false;
        this.saveUser(); // Save the updated cur_user state (logged out)
        localStorage.removeItem("currentUser"); // Remove the session indicator
    }

    // Updates the cur_user's current plan and persists the change
    updatePlan(newPlan) {
        this.plan = newPlan;
        this.saveUser();
    }

    // Cancels the cur_user's current plan and updates localStorage
    cancelPlan() {
        this.plan = null;
        this.saveUser();
    }
}


//----------------------------------------------------------------------------------------------------------------------

// Class to manage subscription plan
// Class to manage subscription plans and sync with the current cur_user
class PlanManager {
    constructor() {
        // Available plans with names and prices
        this.plans = [
            {name: 'Bronze', price: 10},
            {name: 'Gold', price: 10},
            {name: 'Platinum', price: 10}
        ];

        console.log(this.plans)

        // Get the currently logged-in cur_user
        this.currentUser = User.getCurrentUser();

        // Set the current plan from cur_user data or default to 'Free Plan'
        this.currentPlan = this.currentUser?.plan || 'No Plan';

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
        if (!this.plans.some(plan => plan.name === planName) && planName !== 'No Plan') {
            alert('Invalid plan selection');
            return;
        }

        // Set current plan
        this.currentPlan = planName;
        alert(`You have selected ${planName} plan`);

        // Update plan in the cur_user object and save it
        if (this.currentUser) {
            this.currentUser.updatePlan(planName);
        }

        // Reflect changes in UI
        this.updateUI();
    }


    // Cancels the cur_user's current plan
    cancelPlan() {
        if (this.currentPlan === 'No Plan') {
            alert('You currently have no plans')
            return;
        }
        if (confirm('You want to cancel your current plan?')) {
            this.currentPlan = 'No Plan';
        }

        // Cancel plan in cur_user object
        if (this.currentUser) {
            this.currentUser.cancelPlan();
        }

        // Update UI accordingly
        this.updateUI();
    }

//----------------------------------------------------------------------------------------------------------------------

    // Upgrades to the next available plan
    upgradePlan() {
        // Find current plan index in plans array
        const index = this.plans.findIndex(plan => plan.name = this.currentPlan);


        // Check if already at highest plan or plan not found
        if (index === -1 || index === this.plans.length - 1) {
            alert('You are on the highest plan');
        } else {
            const nextPlan = this.plans[index + 2]
            console.log(nextPlan)
            this.selectPlan(nextPlan.name)
        }
    }

//----------------------------------------------------------------------------------------------------------------------

    // Downgrades to the previous available plan
    downgradePlan() {
        // Find current plan index in plans array
        const index = this.plans.findIndex(plan => plan.name = this.currentPlan);
        console.log(index)

        // Check if already at lowest plan
        if (index < 0) {
            alert('You are already on the lowest plan');
            console.log(this.plans)
        } else if (this.currentPlan === 'No Plan') {
            alert('You currently have no plans')
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

//----------------------------------------------------------------------------------------------------------------------

// Toggle between login and registration modes
if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
        isRegisterMode = !isRegisterMode;

        registerFields.style.display = isRegisterMode ? "block" : "none";
        formTitle.textContent = isRegisterMode ? "Register" : "Login";
        submitBtn.textContent = isRegisterMode ? "Create Account" : "Log In";
        toggleBtn.innerHTML = isRegisterMode ? "Back to Login" : "<i class=\"fa fa-cur_user-plus\"></i> Register";
    });
}

//----------------------------------------------------------------------------------------------------------------------

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

            // showToast(`Hey ${name}, welcome to Gymnergy`, 'success')
            toggleBtn.click();

        } else {
            const storedData = localStorage.getItem(email);
            if (!storedData) {
                alert('no cur_user')
                // showToast('User not found. Please register', 'info')
                return;
            }

            const user = Object.assign(new User(), JSON.parse(storedData));
            const success = user.login(email, password);

            if (success) {
                user.saveUser();
                window.location.href = "http://localhost:63342/grroup7/plans.html";
            } else {
                // showToast('Incorrect password', 'error')
                alert("Incorrect password!");
            }
        }
    });
}

//----------------------------------------------------------------------------------------------------------------------

//logging out cur_user
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
            alert('no cur_user')
            console.warn('No cur_user is currently logged in');
            window.location.href = 'http://localhost:63342/grroup7/register.html';
        }
    });
}

//----------------------------------------------------------------------------------------------------------------------

// Set cur_user name on the plans page
const user = User.getCurrentUser();
const username = document.getElementById('username');
if (user) {
    username.textContent = user.name;
} else {
    username.textContent = 'Guest'
}

//----------------------------------------------------------------------------------------------------------------------
//selecting and displaying plans
const basic = document.getElementById('basicBtn');
const gold = document.getElementById('premiumBtn');
const platinum = document.getElementById('platinumBtn');
const cancel = document.getElementById('cancel');
const downgrade = document.getElementById('download');
const upgrade = document.getElementById('upgrade');

const plan = new PlanManager();


basic.addEventListener('click', e => {
    e.preventDefault();
    plan.selectPlan('Bronze')
})

gold.addEventListener('click', e => {
    e.preventDefault();
    plan.selectPlan('Gold')
})

platinum.addEventListener('click', e => {
    e.preventDefault();
    plan.selectPlan('Platinum')
})

cancel.addEventListener('click', e => {
    e.preventDefault();
    plan.cancelPlan();
})


downgrade.addEventListener('click', e => {
    e.preventDefault();
    plan.downgradePlan();
})


upgrade.addEventListener('click', e => {
    e.preventDefault();
    plan.upgradePlan()
})








