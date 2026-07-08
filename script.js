const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

if (siteHeader && menuToggle && siteNav) {
  const closeMenu = () => {
    siteHeader.classList.remove("is-menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("is-menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 680) {
      closeMenu();
    }
  });
}

const newsletterForm = document.querySelector(".newsletter-form");

if (newsletterForm) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    newsletterForm.classList.add("is-submitted");
    const button = newsletterForm.querySelector("button");

    if (button) {
      button.textContent = "Dank je";
    }
  });
}
