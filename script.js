const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
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
