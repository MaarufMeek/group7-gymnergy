// Counter animation function
function animateCounter(element, target, duration) {
    let start = 0;
    const stepTime = Math.abs(Math.floor(duration / target));
    const counter = setInterval(() => {
        start++;
        element.textContent = start;
        if (start === target) clearInterval(counter);
    }, stepTime);
}

// IntersectionObserver to detect scroll into view
const counterSection = document.querySelector('.counter-section');
const counterElement = document.getElementById('session-counter');
let hasCounted = false;

if(counterElement) {

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !hasCounted) {
            animateCounter(counterElement, 50, 2000); // e.g. 50 sessions in 2s
            hasCounted = true;
            observer.unobserve(counterSection);
        }
    });
}, {
    threshold: 0.5 // fire when 50% visible
});

observer.observe(counterSection);

}


//map section


// Set your coordinates here (e.g., KNUST)
const lat = 6.697363;
const lng = -1.683588;

// Initialize map
const map = L.map('map').setView([lat, lng], 16);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add a marker with popup
L.marker([lat, lng]).addTo(map)
    .bindPopup('<b>We are here!</b><br/>Aaamusted - K')
    .openPopup();




   document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }
});
   
   
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('expanded');
        toggleBtn.innerHTML = sidebar.classList.contains('expanded') ?
            '<i class="fa fa-angle-right"></i>' : '<i class="fa fa-angle-left"></i>';
    });




