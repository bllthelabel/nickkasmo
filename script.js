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

const filterPills = document.querySelectorAll(".filter-pill");
const postCards = document.querySelectorAll(".post-card");
const loadMorePosts = document.querySelector("#load-more-posts");
const pillarJumps = document.querySelectorAll("[data-pillar-jump]");
let activePostFilter = "all";
let visiblePostCount = 4;

const updatePosts = () => {
  const matchingPosts = Array.from(postCards).filter((card) => {
    return activePostFilter === "all" || card.dataset.pillar === activePostFilter;
  });

  postCards.forEach((card) => {
    card.hidden = true;
  });

  matchingPosts.slice(0, visiblePostCount).forEach((card) => {
    card.hidden = false;
  });

  if (loadMorePosts) {
    loadMorePosts.hidden = matchingPosts.length <= visiblePostCount;
  }
};

if (filterPills.length && postCards.length) {
  const activateFilter = (filter) => {
    activePostFilter = filter || "all";
    visiblePostCount = 4;

    filterPills.forEach((item) => {
      const isActive = item.dataset.filter === activePostFilter;
      item.classList.toggle("button--primary", isActive);
      item.classList.toggle("button--secondary", !isActive);
    });

    updatePosts();
  };

  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      activateFilter(pill.dataset.filter);
    });
  });

  pillarJumps.forEach((link) => {
    link.addEventListener("click", () => {
      activateFilter(link.dataset.pillarJump);
    });
  });

  updatePosts();
}

if (loadMorePosts) {
  loadMorePosts.addEventListener("click", () => {
    visiblePostCount += 3;
    updatePosts();
  });
}

const contactModal = document.querySelector("[data-contact-modal]");
const contactOpen = document.querySelector("[data-contact-open]");
const contactCloseButtons = document.querySelectorAll("[data-contact-close]");
const newsletterModal = document.querySelector("[data-newsletter-modal]");
const newsletterOpenButtons = document.querySelectorAll("[data-newsletter-open]");
const newsletterCloseButtons = document.querySelectorAll("[data-newsletter-close]");
let lastModalTrigger = null;

if (contactModal && contactOpen) {
  const closeContactModal = () => {
    contactModal.hidden = true;
    contactOpen.focus();
  };

  const openContactModal = () => {
    lastModalTrigger = contactOpen;
    contactModal.hidden = false;
    const firstInput = contactModal.querySelector("#contact-name");

    if (firstInput) {
      firstInput.focus();
    }
  };

  contactOpen.addEventListener("click", openContactModal);

  contactCloseButtons.forEach((button) => {
    button.addEventListener("click", closeContactModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !contactModal.hidden) {
      closeContactModal();
    }
  });
}

if (newsletterModal && newsletterOpenButtons.length) {
  const closeNewsletterModal = () => {
    newsletterModal.hidden = true;

    if (lastModalTrigger) {
      lastModalTrigger.focus();
    }
  };

  const openNewsletterModal = (trigger) => {
    lastModalTrigger = trigger;
    newsletterModal.hidden = false;
    const emailInput = newsletterModal.querySelector("#newsletter-modal-email");

    if (emailInput) {
      emailInput.focus();
    }
  };

  newsletterOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openNewsletterModal(button);
    });
  });

  newsletterCloseButtons.forEach((button) => {
    button.addEventListener("click", closeNewsletterModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !newsletterModal.hidden) {
      closeNewsletterModal();
    }
  });
}

const newsletterForm = document.querySelector(".newsletter-modal-form");

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
