// Main JavaScript for Mom & Kids Website

// Mobile menu toggle with overlay and hamburger animation
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links ul");
const navOverlay = document.querySelector(".nav-overlay");
const navLinksAll = document.querySelectorAll(".nav-link");

function openMenu() {
  navLinks.classList.add("open");
  navOverlay.classList.add("open");
  menuToggle.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeMenu() {
  navLinks.classList.remove("open");
  navOverlay.classList.remove("open");
  menuToggle.classList.remove("open");
  document.body.style.overflow = "";
}
function toggleMenu() {
  if (navLinks.classList.contains("open")) {
    closeMenu();
  } else {
    openMenu();
  }
}
if (menuToggle && navLinks && navOverlay) {
  menuToggle.addEventListener("click", toggleMenu);
  navOverlay.addEventListener("click", closeMenu);
}
// Close menu on nav link click (mobile)
navLinksAll.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
    setActiveLink(link);
  });
});
// Set active link
function setActiveLink(activeLink) {
  navLinksAll.forEach((link) => link.classList.remove("active"));
  activeLink.classList.add("active");
}
// Optionally, set active link based on current hash on page load
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash;
  if (hash) {
    navLinksAll.forEach((link) => {
      if (link.getAttribute("href") === hash) {
        setActiveLink(link);
      }
    });
  }
});
// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// Example: Update cart count (you can expand this logic)
function updateCartCount(count) {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    cartCount.textContent = count;
  }
}

// Example usage: updateCartCount(3);
