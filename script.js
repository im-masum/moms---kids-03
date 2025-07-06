// Main JavaScript for Mom & Kids Website

// Enhanced Navigation Menu Management
class NavigationMenu {
  constructor() {
    this.menuToggle = document.getElementById("menu-toggle");
    this.navLinks = document.querySelector(".nav-links ul");
    this.navOverlay = document.querySelector(".nav-overlay");
    this.navLinksAll = document.querySelectorAll(".nav-link");
    this.navbar = document.querySelector("nav");
    this.isMenuOpen = false;
    this.isAnimating = false;
    this.lastScrollTop = 0;
    this.scrollThreshold = 100;

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
    this.setupScrollEffects();
    this.setupActiveLinkOnLoad();
    this.setupSmoothScrolling();
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
            this.smoothScrollTo(targetElement);
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

    // Navbar scroll effects
    window.addEventListener("scroll", () => {
      this.handleScroll();
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

  setupScrollEffects() {
    // Add scroll-based navbar effects
    this.handleScroll = this.debounce(() => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // Navbar background opacity based on scroll
      if (scrollTop > this.scrollThreshold) {
        this.navbar.classList.add("scrolled");
      } else {
        this.navbar.classList.remove("scrolled");
      }

      // Hide/show navbar on scroll (optional)
      if (scrollTop > this.lastScrollTop && scrollTop > 200) {
        // Scrolling down
        this.navbar.classList.add("nav-hidden");
      } else {
        // Scrolling up
        this.navbar.classList.remove("nav-hidden");
      }

      this.lastScrollTop = scrollTop;
    }, 10);
  }

  setupSmoothScrolling() {
    // Smooth scroll for all internal links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (href === "#") return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          this.smoothScrollTo(target);
        }
      });
    });
  }

  smoothScrollTo(target, offset = 80) {
    const targetPosition = target.offsetTop - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start = null;

    function animation(currentTime) {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
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

    // Update active link on scroll
    this.setupScrollSpy();
  }

  setupScrollSpy() {
    // Enhanced scroll spy to highlight current section
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

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize navigation menu
let navigationMenu;
document.addEventListener("DOMContentLoaded", () => {
  navigationMenu = new NavigationMenu();
});

// Enhanced Dark Mode Toggle
class DarkModeToggle {
  constructor() {
    this.isDarkMode = false;
    this.toggleButton = document.querySelector(".dark-toggle");
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
      this.updateToggleButton();
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
          this.updateToggleButton();
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

    this.updateToggleButton();
    this.showToggleFeedback();
  }

  updateToggleButton() {
    if (this.toggleButton) {
      this.toggleButton.textContent = this.isDarkMode ? "☀️" : "🌙";
      this.toggleButton.setAttribute(
        "aria-label",
        this.isDarkMode ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }

  showToggleFeedback() {
    // Create temporary feedback element
    const feedback = document.createElement("div");
    feedback.textContent = this.isDarkMode
      ? "Dark mode enabled"
      : "Light mode enabled";
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
      font-size: 14px;
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
    this.cartIcon = document.getElementById("cart");
    this.cartCountElement = document.getElementById("cart-count");
    this.init();
  }

  init() {
    this.updateCartCount();
    this.setupCartIcon();
    this.setupCartAnimations();
  }

  setupCartIcon() {
    if (this.cartIcon) {
      this.cartIcon.addEventListener("click", (e) => {
        e.preventDefault();
        // Add haptic feedback for mobile
        if ("vibrate" in navigator) {
          navigator.vibrate(50);
        }
        // Navigate to cart page or open cart modal
        window.location.href = "cart.html";
      });

      // Add hover effects
      this.cartIcon.addEventListener("mouseenter", () => {
        this.cartIcon.style.transform = "scale(1.1)";
      });

      this.cartIcon.addEventListener("mouseleave", () => {
        this.cartIcon.style.transform = "scale(1)";
      });
    }
  }

  setupCartAnimations() {
    // Add CSS animation class when cart count changes
    if (this.cartCountElement) {
      this.cartCountElement.addEventListener("animationend", () => {
        this.cartCountElement.classList.remove("cart-count-update");
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
    this.animateCartIcon();
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
    if (this.cartCountElement) {
      this.cartCountElement.textContent = this.cartCount;

      // Add animation class
      this.cartCountElement.classList.add("cart-count-update");
    }
  }

  animateCartIcon() {
    if (this.cartIcon) {
      this.cartIcon.style.transform = "scale(1.2)";
      setTimeout(() => {
        this.cartIcon.style.transform = "scale(1)";
      }, 200);
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

// Enhanced form handling
class FormHandler {
  constructor() {
    this.forms = document.querySelectorAll("form");
    this.init();
  }

  init() {
    this.forms.forEach((form) => {
      this.setupForm(form);
    });
  }

  setupForm(form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit(form);
    });

    // Add real-time validation
    const inputs = form.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        this.validateField(input);
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = "";

    // Remove existing error styling
    field.classList.remove("error");

    // Validation rules
    if (field.hasAttribute("required") && !value) {
      isValid = false;
      message = "This field is required";
    } else if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = "Please enter a valid email address";
      }
    }

    if (!isValid) {
      field.classList.add("error");
      this.showFieldError(field, message);
    } else {
      this.hideFieldError(field);
    }

    return isValid;
  }

  showFieldError(field, message) {
    // Remove existing error message
    this.hideFieldError(field);

    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      color: #e74c3c;
      font-size: 12px;
      margin-top: 4px;
      display: block;
    `;

    field.parentNode.appendChild(errorDiv);
  }

  hideFieldError(field) {
    const existingError = field.parentNode.querySelector(".field-error");
    if (existingError) {
      existingError.remove();
    }
  }

  handleFormSubmit(form) {
    const inputs = form.querySelectorAll("input, textarea");
    let isValid = true;

    // Validate all fields
    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    if (isValid) {
      this.showSuccessMessage(form);
      form.reset();
    }
  }

  showSuccessMessage(form) {
    const successDiv = document.createElement("div");
    successDiv.className = "form-success";
    successDiv.textContent =
      "Thank you! Your message has been sent successfully.";
    successDiv.style.cssText = `
      background: #27ae60;
      color: white;
      padding: 12px;
      border-radius: 8px;
      margin-top: 16px;
      text-align: center;
    `;

    form.appendChild(successDiv);

    setTimeout(() => {
      successDiv.remove();
    }, 5000);
  }
}

// Initialize form handler
let formHandler;
document.addEventListener("DOMContentLoaded", () => {
  formHandler = new FormHandler();
});

// Enhanced scroll animations
class ScrollAnimations {
  constructor() {
    this.animatedElements = document.querySelectorAll(".animate-on-scroll");
    this.init();
  }

  init() {
    if (this.animatedElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
          }
        });
      },
      { threshold: 0.1 }
    );

    this.animatedElements.forEach((el) => observer.observe(el));
  }
}

// Initialize scroll animations
let scrollAnimations;
document.addEventListener("DOMContentLoaded", () => {
  scrollAnimations = new ScrollAnimations();
});

// Add to cart button functionality with enhanced feedback
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-to-cart-btn")) {
    const productCard = e.target.closest(".product-card");
    if (productCard) {
      const productId =
        productCard.dataset.productId ||
        "product-" + Math.random().toString(36).substr(2, 9);
      addToCart(productId, 1);

      // Enhanced visual feedback
      e.target.textContent = "Added!";
      e.target.style.background = "var(--btn-primary-bg)";
      e.target.style.color = "var(--btn-primary-text)";
      e.target.style.transform = "scale(0.95)";

      setTimeout(() => {
        e.target.textContent = "Add to Cart";
        e.target.style.background = "";
        e.target.style.color = "";
        e.target.style.transform = "";
      }, 1500);
    }
  }
});

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

  // Add scroll-based navbar effects CSS
  const style = document.createElement("style");
  style.textContent = `
    nav {
      transition: all 0.3s ease;
    }
    
    nav.scrolled {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }
    
    .dark-mode nav.scrolled {
      background: rgba(35, 35, 54, 0.95);
    }
    
    nav.nav-hidden {
      transform: translateY(-100%);
    }
    
    .cart-count-update {
      animation: cartCountPulse 0.3s ease;
    }
    
    @keyframes cartCountPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    
    .field-error {
      animation: shake 0.5s ease;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease;
    }
    
    .animate-on-scroll.animated {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
});
