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

const itemFilterPills = document.querySelectorAll(".item-filter-pill");
const itemRows = document.querySelectorAll("[data-tags]");

if (itemFilterPills.length && itemRows.length) {
  const activateItemFilter = (filter) => {
    const activeFilter = filter || "all";

    itemFilterPills.forEach((item) => {
      const isActive = item.dataset.itemFilter === activeFilter;
      item.classList.toggle("button--primary", isActive);
      item.classList.toggle("button--secondary", !isActive);
    });

    itemRows.forEach((item) => {
      const tags = (item.dataset.tags || "").split(" ");
      item.hidden = activeFilter !== "all" && !tags.includes(activeFilter);
    });
  };

  itemFilterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      activateItemFilter(pill.dataset.itemFilter);
    });
  });
}

const projectFilterPills = document.querySelectorAll(".project-filter-pill");
const projectCards = document.querySelectorAll("[data-project-tags]");
const projectCount = document.querySelector("[data-project-count]");

if (projectFilterPills.length && projectCards.length) {
  const activateProjectFilter = (filter) => {
    const activeFilter = filter || "all";
    let visibleCount = 0;

    projectFilterPills.forEach((item) => {
      const isActive = item.dataset.projectFilter === activeFilter;
      item.classList.toggle("button--primary", isActive);
      item.classList.toggle("button--secondary", !isActive);
    });

    projectCards.forEach((item) => {
      const tags = (item.dataset.projectTags || "").split(" ");
      const isVisible = activeFilter === "all" || tags.includes(activeFilter);
      item.hidden = !isVisible;
      visibleCount += isVisible ? 1 : 0;
    });

    if (projectCount) {
      projectCount.textContent = visibleCount;
    }
  };

  projectFilterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      activateProjectFilter(pill.dataset.projectFilter);
    });
  });
}

const newsletterModal = document.querySelector("[data-newsletter-modal]");
const newsletterOpenButtons = document.querySelectorAll("[data-newsletter-open]");
const newsletterCloseButtons = document.querySelectorAll("[data-newsletter-close]");
let lastModalTrigger = null;

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
    button.addEventListener("click", (event) => {
      event.preventDefault();
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

async function submitForm(form, buildPayload) {
  const endpoint = form.dataset.endpoint;
  const button = form.querySelector("button[type=submit]");
  const errorEl = form.querySelector("[data-form-error]");
  const originalButtonText = button ? button.textContent : "";

  if (errorEl) {
    errorEl.textContent = "";
  }
  if (button) {
    button.disabled = true;
    button.textContent = "Versturen…";
  }

  const fallbackMessage = "Er ging iets mis. Probeer het later opnieuw.";

  try {
    let response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
    } catch {
      throw new Error(fallbackMessage);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || fallbackMessage);
    }

    form.classList.add("is-submitted");
    if (button) {
      button.textContent = "Verstuurd";
    }
    const successEl = form.querySelector("[data-form-success]");
    if (successEl) {
      successEl.textContent = form.dataset.successMessage || "Gelukt.";
    }
  } catch (error) {
    if (button) {
      button.disabled = false;
      button.textContent = originalButtonText;
    }
    if (errorEl) {
      errorEl.textContent = error.message || fallbackMessage;
    }
  }
}

const newsletterForm = document.querySelector("[data-newsletter-form]");

if (newsletterForm) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitForm(newsletterForm, () => ({
      email: newsletterForm.querySelector("#newsletter-modal-email").value,
      website: newsletterForm.querySelector("#newsletter-modal-website").value,
    }));
  });
}

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitForm(contactForm, () => ({
      voornaam: contactForm.querySelector("#contact-voornaam").value,
      achternaam: contactForm.querySelector("#contact-achternaam").value,
      email: contactForm.querySelector("#contact-email").value,
      bericht: contactForm.querySelector("#contact-message").value,
      website: contactForm.querySelector("#contact-website").value,
    }));
  });
}
