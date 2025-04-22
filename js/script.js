function animateCounter(element, target, duration) {
    let start = 0;
    const stepTime = Math.abs(Math.floor(duration / target));
    const counter = setInterval(() => {
        start++;
        element.textContent = start;
        if (start === target) clearInterval(counter);
    }, stepTime);
}

const counterSection = document.querySelector('.counter-section');
const counterElement = document.getElementById('session-counter');
let hasCounted = false;

if (counterElement) {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasCounted) {
                animateCounter(counterElement, 50, 2000);
                hasCounted = true;
                observer.unobserve(counterSection);
            }
        });
    }, { threshold: 0.5 });
    observer.observe(counterSection);
}

const lat = 6.697363;
const lng = -1.683588;
const map = L.map('map').setView([lat, lng], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
L.marker([lat, lng]).addTo(map)
    .bindPopup('<b>We are here!</b><br/>Aaamusted - K')
    .openPopup();

// Search Functionality
const searchBar = document.getElementById('searchBar');
const searchBtn = document.getElementById('searchBtn');
if (searchBar && searchBtn) {
    searchBtn.addEventListener('click', () => {
        const query = searchBar.value.trim().toLowerCase();
        if (!query) {
            alert('Please enter a search term');
            return;
        }
        const serviceCards = document.querySelectorAll('.service-card');
        let found = false;
        serviceCards.forEach(card => {
            const searchData = card.getAttribute('data-search').toLowerCase();
            if (searchData.includes(query)) {
                card.scrollIntoView({ behavior: 'smooth' });
                card.style.border = '2px solid #ff0000';
                setTimeout(() => card.style.border = '', 3000);
                found = true;
            }
        });
        if (!found) {
            alert('No results found. Try another term.');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('toggle-Btn');
    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            const searchContainer = document.querySelector('.search-container');
            const search = document.getElementById('searchBar');
            
            if(sidebar.classList.contains('expanded')) {
                searchContainer.style.right = '70%';
                search.style.maxWidth = '100px';
            } else {
                searchContainer.style.right = '50%';
                search.style.maxWidth = '170px';
            }      
            
            toggle.innerHTML = 
                sidebar
                    .classList
                    .contains('expanded') ? 
                    '<i class="fa fa-angle-right"></i>' : 
                    '<i class="fa fa-angle-left"></i>';
        });
    }

    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".nav-links li a").forEach(link => {
        const linkPage = link.getAttribute("href");
        if (linkPage === currentPage) {
            link.classList.add("active");
        }
    });
});