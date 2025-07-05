// Main JavaScript for Mom & Kids Website

// Enhanced Navigation Menu Management
class NavigationMenu {
  constructor() {
    this.menuToggle = document.getElementById("menu-toggle");
    this.navLinks = document.querySelector(".nav-links ul");
    this.navOverlay = document.querySelector(".nav-overlay");
    this.navLinksAll = document.querySelectorAll(".nav-link");
    this.isMenuOpen = false;
    this.isAnimating = false;

    this.init();
  }

  init() {
    if (!this.menuToggle || !this.navLinks || !this.navOverlay) {
      console.warn("Navigation elements not found");
      return;
    }

    this.setupEventListeners();
    this.setupKeyboardSupport();
    this.setupResizeHandler();
    this.setupActiveLinkOnLoad();
  }

  setupEventListeners() {
    // Menu toggle button
    this.menuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleMenu();
    });

    // Overlay click to close
    this.navOverlay.addEventListener("click", (e) => {
      if (e.target === this.navOverlay) {
        this.closeMenu();
      }
    });

    // Close menu on nav link click (mobile)
    this.navLinksAll.forEach((link) => {
      link.addEventListener("click", (e) => {
        // Prevent default only if it's a hash link
        if (link.getAttribute("href").startsWith("#")) {
          e.preventDefault();
          const targetId = link.getAttribute("href").substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            // Smooth scroll to target
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }

        this.closeMenu();
        this.setActiveLink(link);
      });
    });

    // Prevent menu from closing when clicking inside nav links
    this.navLinks.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  setupKeyboardSupport() {
    // ESC key to close menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isMenuOpen) {
        this.closeMenu();
        this.menuToggle.focus(); // Return focus to toggle button
      }
    });

    // Tab trap inside menu when open
    this.navLinks.addEventListener("keydown", (e) => {
      if (!this.isMenuOpen) return;

      const focusableElements = this.navLinks.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });

    // Enter and Space key support for menu toggle
    this.menuToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggleMenu();
      }
    });
  }

  setupResizeHandler() {
    // Close menu on window resize to prevent layout issues
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && this.isMenuOpen) {
          this.closeMenu();
        }
      }, 250);
    });
  }

  openMenu() {
    if (this.isAnimating || this.isMenuOpen) return;

    this.isAnimating = true;
    this.isMenuOpen = true;

    // Update ARIA attributes
    this.menuToggle.setAttribute("aria-expanded", "true");
    this.menuToggle.setAttribute("aria-label", "Close menu");
    this.navLinks.setAttribute("aria-hidden", "false");

    // Add classes with slight delay for smooth animation
    requestAnimationFrame(() => {
      this.navLinks.classList.add("open");
      this.navOverlay.classList.add("open");
      this.menuToggle.classList.add("open");
    });

    // Prevent body scroll
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = this.getScrollbarWidth() + "px";

    // Focus management
    setTimeout(() => {
      const firstLink = this.navLinks.querySelector("a");
      if (firstLink) {
        firstLink.focus();
      }
    }, 300);

    // Animation complete
    setTimeout(() => {
      this.isAnimating = false;
    }, 300);
  }

  closeMenu() {
    if (this.isAnimating || !this.isMenuOpen) return;

    this.isAnimating = true;
    this.isMenuOpen = false;

    // Update ARIA attributes
    this.menuToggle.setAttribute("aria-expanded", "false");
    this.menuToggle.setAttribute("aria-label", "Open menu");
    this.navLinks.setAttribute("aria-hidden", "true");

    // Remove classes
    this.navLinks.classList.remove("open");
    this.navOverlay.classList.remove("open");
    this.menuToggle.classList.remove("open");

    // Restore body scroll
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    // Animation complete
    setTimeout(() => {
      this.isAnimating = false;
    }, 300);
  }

  toggleMenu() {
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  getScrollbarWidth() {
    // Calculate scrollbar width to prevent layout shift
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.overflow = "scroll";
    document.body.appendChild(outer);

    const inner = document.createElement("div");
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
  }

  setActiveLink(activeLink) {
    this.navLinksAll.forEach((link) => {
      link.classList.remove("active");
      link.setAttribute("aria-current", "false");
    });

    activeLink.classList.add("active");
    activeLink.setAttribute("aria-current", "page");
  }

  setupActiveLinkOnLoad() {
    // Set active link based on current hash on page load
    const hash = window.location.hash;
    if (hash) {
      this.navLinksAll.forEach((link) => {
        if (link.getAttribute("href") === hash) {
          this.setActiveLink(link);
        }
      });
    }

    // Update active link on scroll (optional)
    this.setupScrollSpy();
  }

  setupScrollSpy() {
    // Simple scroll spy to highlight current section
    const sections = document.querySelectorAll("section[id]");
    if (!sections.length) return;

    const observerOptions = {
      rootMargin: "-20% 0px -35% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          this.navLinksAll.forEach((link) => {
            if (link.getAttribute("href") === `#${id}`) {
              this.setActiveLink(link);
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));
  }
}

// Initialize navigation menu
let navigationMenu;
document.addEventListener("DOMContentLoaded", () => {
  navigationMenu = new NavigationMenu();
});

// Dark mode toggle with enhanced functionality
class DarkModeToggle {
  constructor() {
    this.isDarkMode = false;
    this.init();
  }

  init() {
    // Check for saved preference or system preference
    const savedPreference = localStorage.getItem("darkMode");
    const systemPreference = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    this.isDarkMode =
      savedPreference !== null ? savedPreference === "true" : systemPreference;

    if (this.isDarkMode) {
      document.body.classList.add("dark-mode");
    }

    // Listen for system preference changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (localStorage.getItem("darkMode") === null) {
          this.isDarkMode = e.matches;
          if (this.isDarkMode) {
            document.body.classList.add("dark-mode");
          } else {
            document.body.classList.remove("dark-mode");
          }
        }
      });
  }

  toggle() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }

    // Update toggle button text
    const toggleButton = document.querySelector(".dark-toggle");
    if (toggleButton) {
      toggleButton.textContent = this.isDarkMode ? "☀️" : "🌙";
      toggleButton.setAttribute(
        "aria-label",
        this.isDarkMode ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }
}

// Initialize dark mode toggle
let darkModeToggle;
document.addEventListener("DOMContentLoaded", () => {
  darkModeToggle = new DarkModeToggle();
});

// Global dark mode toggle function
function toggleDarkMode() {
  if (darkModeToggle) {
    darkModeToggle.toggle();
  }
}

// Enhanced Cart Management
class CartManager {
  constructor() {
    this.cartCount = 0;
    this.cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    this.init();
  }

  init() {
    this.updateCartCount();
    this.setupCartIcon();
  }

  setupCartIcon() {
    const cartIcon = document.getElementById("cart");
    if (cartIcon) {
      cartIcon.addEventListener("click", (e) => {
        e.preventDefault();
        // Add haptic feedback for mobile
        if ("vibrate" in navigator) {
          navigator.vibrate(50);
        }
        // Navigate to cart page or open cart modal
        window.location.href = "cart.html";
      });
    }
  }

  addToCart(productId, quantity = 1) {
    const existingItem = this.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ id: productId, quantity });
    }

    this.saveCart();
    this.updateCartCount();
    this.showAddToCartFeedback();
  }

  removeFromCart(productId) {
    this.cartItems = this.cartItems.filter((item) => item.id !== productId);
    this.saveCart();
    this.updateCartCount();
  }

  updateQuantity(productId, quantity) {
    const item = this.cartItems.find((item) => item.id === productId);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.removeFromCart(productId);
      } else {
        this.saveCart();
        this.updateCartCount();
      }
    }
  }

  saveCart() {
    localStorage.setItem("cartItems", JSON.stringify(this.cartItems));
  }

  updateCartCount() {
    this.cartCount = this.cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
      cartCountElement.textContent = this.cartCount;

      // Add animation class
      cartCountElement.classList.add("cart-count-update");
      setTimeout(() => {
        cartCountElement.classList.remove("cart-count-update");
      }, 300);
    }
  }

  showAddToCartFeedback() {
    // Create temporary feedback element
    const feedback = document.createElement("div");
    feedback.textContent = "Added to cart!";
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--btn-primary-bg);
      color: var(--btn-primary-text);
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      font-weight: 600;
    `;

    document.body.appendChild(feedback);

    // Animate in
    requestAnimationFrame(() => {
      feedback.style.transform = "translateX(0)";
    });

    // Remove after delay
    setTimeout(() => {
      feedback.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(feedback);
      }, 300);
    }, 2000);
  }

  getCartItems() {
    return this.cartItems;
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
    this.updateCartCount();
  }
}

// Initialize cart manager
let cartManager;
document.addEventListener("DOMContentLoaded", () => {
  cartManager = new CartManager();
});

// Global cart functions
function updateCartCount(count) {
  if (cartManager) {
    cartManager.cartCount = count;
    cartManager.updateCartCount();
  }
}

function addToCart(productId, quantity = 1) {
  if (cartManager) {
    cartManager.addToCart(productId, quantity);
  }
}

// Enhanced animated achievement counters
function animateCounter(element, target, duration = 1200) {
  let start = 0;
  const increment = target / (duration / 16);

  function update() {
    start += increment;
    if (start >= target) {
      element.textContent = target.toLocaleString();
    } else {
      element.textContent = Math.floor(start).toLocaleString();
      requestAnimationFrame(update);
    }
  }
  update();
}

function animateAchievementsWhenVisible() {
  const achievements = document.querySelectorAll(".achievement-number");
  if (!achievements.length) return;

  let animated = false;
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated) {
          achievements.forEach((el) => {
            const target = parseInt(el.getAttribute("data-count"), 10);
            animateCounter(el, target);
          });
          animated = true;
          obs.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  achievements.forEach((el) => observer.observe(el));
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all components
  animateAchievementsWhenVisible();

  // Pulse animation for About header accent heart
  const accent = document.querySelector(".about-title .title-accent");
  if (accent) {
    accent.style.animation = "pulseAccent 1.5s infinite alternate";
  }

  // Add loading animation
  document.body.classList.add("loaded");
});

// Add to cart button functionality
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-to-cart-btn")) {
    const productCard = e.target.closest(".product-card");
    if (productCard) {
      const productId =
        productCard.dataset.productId ||
        "product-" + Math.random().toString(36).substr(2, 9);
      addToCart(productId, 1);

      // Add visual feedback
      e.target.textContent = "Added!";
      e.target.style.background = "var(--btn-primary-bg)";
      e.target.style.color = "var(--btn-primary-text)";

      setTimeout(() => {
        e.target.textContent = "Add to Cart";
        e.target.style.background = "";
        e.target.style.color = "";
      }, 1500);
    }
  }
});
