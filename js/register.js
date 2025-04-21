function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.classList.add("toast", type);
    toast.setAttribute('role', 'alert');
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function obfuscate(str) {
    return btoa(str.split('').reverse().join(''));
}
function deobfuscate(str) {
    return atob(str).split('').reverse().join('');
}

function generateToken() {
    return Math.random().toString(36).substr(2);
}

class User {
    constructor(name, email, password, phone, plan = null) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.isLoggedIn = false;
        this.hasRegistered = false;
        this.plan = plan;
    }
    static getCurrentUser() {
        const email = localStorage.getItem("currentUser");
        if (!email) return null;
        const data = localStorage.getItem(obfuscate(email));
        if (!data) return null;
        const parsed = JSON.parse(deobfuscate(data));
        const user = new User(parsed.name, parsed.email, parsed.password, parsed.phone, parsed.plan);
        user.isLoggedIn = parsed.isLoggedIn;
        user.hasRegistered = parsed.hasRegistered;
        return user;
    }
    static isUserLoggedIn() {
        const user = User.getCurrentUser();
        return user && user.isLoggedIn;
    }
    saveUser() {
        localStorage.setItem(obfuscate(this.email), obfuscate(JSON.stringify(this)));
    }
    registerUser() {
        this.hasRegistered = true;
        this.saveUser();
    }
    login(email, password) {
        if (this.email === email && this.password === password) {
            this.isLoggedIn = true;
            this.saveUser();
            localStorage.setItem("currentUser", email);
            return true;
        }
        return false;
    }
    logout() {
        this.isLoggedIn = false;
        this.saveUser();
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
}

class PlanManager {
    constructor() {
        this.plans = [
            {name: 'Bronze', price: 'GHS140/m', amount: 14000}, // Amount in pesewas for Stripe
            {name: 'Gold', price: 'GHS220/m', amount: 22000},
            {name: 'Platinum', price: 'GHS422/m', amount: 42200}
        ];
        this.currentUser = User.getCurrentUser();
        this.currentPlan = this.currentUser?.plan || 'No Plan';
        this.planElementName = document.getElementById('plan-name');
        // Stripe initialization
        this.stripe = Stripe('pk_test_51J9'); // Mock public key
        this.elements = this.stripe.elements();
        this.card = this.elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#32325d',
                }
            }
        });
        this.setupPaymentModal();
        this.updateUI();
    }
    setupPaymentModal() {
        const modal = document.getElementById('paymentModal');
        const closeModal = document.getElementById('closeModal');
        const submitPayment = document.getElementById('submitPayment');
        const cardElement = document.getElementById('cardElement');
        if (cardElement) {
            this.card.mount('#cardElement');
        }
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.style.display = 'none';
                this.card.clear();
            });
        }
        if (submitPayment) {
            submitPayment.addEventListener('click', () => {
                // Simulate payment success (no real token creation)
                showToast(`Payment for ${this.currentPlan} successful!`, 'success');
                this.selectPlan(this.currentPlan);
                modal.style.display = 'none';
                this.card.clear();
            });
        }
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                this.card.clear();
            }
        });
    }
    updateUI() {
        if (this.planElementName) {
            this.planElementName.textContent = this.currentPlan;
        }
    }
    selectPlan(planName) {
        if (!this.plans.some(plan => plan.name === planName) && planName !== 'No Plan') {
            showToast('Invalid plan selection', 'error');
            return;
        }
        this.currentPlan = planName;
        showToast(`You have selected ${planName} plan`, 'success');
        if (this.currentUser) {
            this.currentUser.updatePlan(planName);
        }
        this.updateUI();
    }
    cancelPlan() {
        if (this.currentPlan === 'No Plan') {
            showToast('You currently have no plans', 'info');
            return;
        }
        if (confirm('You want to cancel your current plan?')) {
            this.currentPlan = 'No Plan';
            if (this.currentUser) {
                this.currentUser.cancelPlan();
            }
            this.updateUI();
        }
    }
    upgradePlan() {
        const index = this.plans.findIndex(plan => plan.name === this.currentPlan);
        if (this.currentPlan === 'No Plan') {
            showToast('You currently have no plans', 'info');
        } else if (index === -1 || index === this.plans.length - 1) {
            showToast('You are on the highest plan already', 'info');
        } else {
            const nextPlan = this.plans[index + 1];
            this.selectPlan(nextPlan.name);
        }
    }
    downgradePlan() {
        const index = this.plans.findIndex(plan => plan.name === this.currentPlan);
        if (this.currentPlan === "No Plan" || index === -1) {
            showToast("You currently have no plan or an invalid plan", "info");
            return;
        }
        if (index === 0) {
            showToast("You are on the lowest plan already", "info");
            return;
        }
        const prevPlan = this.plans[index - 1];
        this.selectPlan(prevPlan.name);
    }
    processPayment(planName) {
        const plan = this.plans.find(p => p.name === planName);
        if (!plan) {
            showToast('Invalid plan selected', 'error');
            return;
        }
        this.currentPlan = planName;
        const modal = document.getElementById('paymentModal');
        const planDetails = document.getElementById('planDetails');
        if (modal && planDetails) {
            planDetails.textContent = `Pay ${plan.price} for ${planName} plan`;
            modal.style.display = 'block';
        }
    }
}

const authForm = document.getElementById("authForm");
const formTitle = document.getElementById("formTitle");
const toggleBtn = document.getElementById("toggle");
const submitBtn = document.getElementById("submitBtn");
const registerFields = document.getElementById("registerFields");

let isRegisterMode = false;
let formToken = generateToken();
localStorage.setItem('formToken', formToken);

if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
        isRegisterMode = !isRegisterMode;
        registerFields.style.display = isRegisterMode ? "block" : "none";
        formTitle.textContent = isRegisterMode ? "Register" : "Login";
        submitBtn.textContent = isRegisterMode ? "Create Account" : "Log In";
        toggleBtn.innerHTML = isRegisterMode ? "Back to Login" : "<i class=\"fa fa-user-plus\"></i> Register";
        formToken = generateToken();
        localStorage.setItem('formToken', formToken);
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

function validatePhone(phone) {
    const re = /^\+?\d{10,15}$/;
    return re.test(phone);
}

if (authForm) {
    authForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const storedToken = localStorage.getItem('formToken');
        if (storedToken !== formToken) {
            showToast('Invalid form submission', 'error');
            return;
        }
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        if (!email || !password) {
            showToast('Please fill out all required fields', 'info');
            return;
        }
        if (!validateEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }
        if (!validatePassword(password)) {
            showToast('Password must be 8+ characters, with uppercase and numbers', 'error');
            return;
        }
        if (isRegisterMode) {
            const name = document.getElementById("name").value.trim();
            const phone = document.getElementById("phone").value.trim();
            if (!name || !phone) {
                showToast('Please complete all registration fields', 'info');
                return;
            }
            if (!validatePhone(phone)) {
                showToast('Please enter a valid phone number (10-15 digits)', 'error');
                return;
            }
            if (localStorage.getItem(obfuscate(email))) {
                showToast('User already registered. Please log in', 'info');
                isRegisterMode = false;
                toggleBtn.click();
                return;
            }
            const newUser = new User(name, email, password, phone);
            newUser.registerUser();
            showToast(`Hey ${name}, you are welcome to Gymnergy`, 'success');
            authForm.reset();
            isRegisterMode = false;
            toggleBtn.click();
            formToken = generateToken();
            localStorage.setItem('formToken', formToken);
        } else {
            const storedData = localStorage.getItem(obfuscate(email));
            if (!storedData) {
                showToast("User does not exist", 'error');
                return;
            }
            const user = Object.assign(new User(), JSON.parse(deobfuscate(storedData)));
            const success = user.login(email, password);
            if (success) {
                user.saveUser();
                window.location.href = "plans.html";
                formToken = generateToken();
                localStorage.setItem('formToken', formToken);
            } else {
                showToast('Incorrect password', 'error');
            }
        }
    });
}

const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const user = User.getCurrentUser();
        if (user) {
            user.logout();
            window.location.href = 'register.html';
        } else {
            window.location.href = 'register.html';
        }
    });
}

const user = User.getCurrentUser();
const username = document.getElementById('username');
if (user) {
    username.textContent = user.name;
} else {
    username.textContent = 'Guest';
}

const Bronze = document.getElementById('basicBtn');
const Gold = document.getElementById('premiumBtn');
const Platinum = document.getElementById('platinumBtn');
const payBasic = document.getElementById('payBasic');
const payGold = document.getElementById('payGold');
const payPlatinum = document.getElementById('payPlatinum');
const cancel = document.getElementById('cancel');
const downgrade = document.getElementById('download');
const upgrade = document.getElementById('upgrade');
const priceBasic = document.getElementById('priceBasic');
const priceGold = document.getElementById('priceGold');
const pricePlatinum = document.getElementById('pricePlatinum');

const plan = new PlanManager();

priceBasic.innerText = plan.plans.find(plan => plan.name === 'Bronze').price;
priceGold.innerText = plan.plans.find(plan => plan.name === 'Gold').price;
pricePlatinum.innerText = plan.plans.find(plan => plan.name === 'Platinum').price;

Bronze.addEventListener('click', e => {
    e.preventDefault();
    plan.selectPlan('Bronze');
});

Gold.addEventListener('click', e => {
    e.preventDefault();
    plan.selectPlan('Gold');
});

Platinum.addEventListener('click', e => {
    e.preventDefault();
    plan.selectPlan('Platinum');
});

payBasic.addEventListener('click', e => {
    e.preventDefault();
    plan.processPayment('Bronze');
});

payGold.addEventListener('click', e => {
    e.preventDefault();
    plan.processPayment('Gold');
});

payPlatinum.addEventListener('click', e => {
    e.preventDefault();
    plan.processPayment('Platinum');
});

cancel.addEventListener('click', e => {
    e.preventDefault();
    plan.cancelPlan();
});

downgrade.addEventListener('click', e => {
    e.preventDefault();
    plan.downgradePlan();
});

upgrade.addEventListener('click', e => {
    e.preventDefault();
    plan.upgradePlan();
});