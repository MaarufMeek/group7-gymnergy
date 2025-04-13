class User {
    constructor(name, email, password, phone) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.isLoggedIn = false;
        this.hasRegistered = false;
    }

    static getCurrentUser() {
        const user = localStorage.getItem("currentUser");
        if (!user) return null;

        const data = localStorage.getItem(user);
        if (!data) return null;

        // Create new User instance
        const parsed = JSON.parse(data);
        return new User(parsed.name, parsed.email, parsed.password, parsed.phone);
    }

    static isUserLoggedIn() {
        const user = User.getCurrentUser();
        return user && user.isLoggedIn;
    }

    saveUser() {
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
        this.saveUser() // persist logoutBtn status
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
    if(authForm){
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
                window.location.href = "plans.html";
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
    





