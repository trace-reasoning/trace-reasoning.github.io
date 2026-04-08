"use strict";

const CONFIG = {
  // Fill this with the public arXiv URL to automatically reveal the arXiv buttons.
  arxivUrl: "https://arxiv.org/abs/2603.23404",
};

const prefersReducedMotion =
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupArxivLinks() {
  const links = document.querySelectorAll(".js-arxiv");

  links.forEach((link) => {
    if (CONFIG.arxivUrl) {
      link.href = CONFIG.arxivUrl;
      link.hidden = false;
    } else {
      link.hidden = true;
    }
  });
}

function setupReveal() {
  const reveals = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    reveals.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  reveals.forEach((element) => observer.observe(element));
}

function animateValue(element) {
  const target = Number(element.dataset.count || "0");
  const prefix = element.dataset.prefix || "";
  const decimals = target % 1 === 0 ? 0 : 2;
  const duration = 1260;
  const delay = Number(element.dataset.delay || "0");

  function render(value) {
    element.textContent = `${prefix}${value.toFixed(decimals)}`;
  }

  function start() {
    const startTime = performance.now();

    element.classList.remove("is-animated");
    element.classList.add("is-counting");

    function tick(timestamp) {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedBase = 1 - Math.pow(1 - progress, 4);
      const bounce = Math.sin(progress * Math.PI) * 0.035 * (1 - progress);
      const eased = Math.min(easedBase + bounce, 1);

      render(target * eased);

      if (progress < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      render(target);
      element.classList.remove("is-counting");
      element.classList.add("is-animated");
    }

    window.requestAnimationFrame(tick);
  }

  window.setTimeout(start, delay);
}

function setupMetricAnimations() {
  const values = document.querySelectorAll(".metric-value[data-count]");

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    values.forEach((element) => {
      const target = Number(element.dataset.count || "0");
      const prefix = element.dataset.prefix || "";
      const decimals = target % 1 === 0 ? 0 : 2;
      element.textContent = `${prefix}${target.toFixed(decimals)}`;
      element.classList.add("is-animated");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.animated === "true") {
          return;
        }

        const index = Number(entry.target.dataset.index || "0");
        entry.target.dataset.delay = String(index * 80);
        animateValue(entry.target);
        entry.target.dataset.animated = "true";
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  values.forEach((element, index) => {
    element.dataset.index = String(index);
    observer.observe(element);
  });
}

function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = lightbox ? lightbox.querySelector("img") : null;
  const lightboxTitle = lightbox ? lightbox.querySelector(".lightbox-title") : null;
  const lightboxCaption = lightbox ? lightbox.querySelector(".lightbox-caption") : null;
  const closeButton = lightbox ? lightbox.querySelector(".lightbox-close") : null;
  const galleryCards = document.querySelectorAll(".gallery-card");

  if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxCaption || !closeButton) {
    return;
  }

  const close = () => {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  };

  galleryCards.forEach((card) => {
    card.addEventListener("click", () => {
      const image = card.dataset.image || "";
      const title = card.dataset.title || "";
      const caption = card.dataset.caption || "";

      lightboxImage.src = image;
      lightboxImage.alt = title;
      lightboxTitle.textContent = title;
      lightboxCaption.textContent = caption;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  closeButton.addEventListener("click", close);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      close();
    }
  });
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function setupCopyButtons() {
  const buttons = document.querySelectorAll("[data-copy-target]");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const targetId = button.getAttribute("data-copy-target");
      const target = targetId ? document.getElementById(targetId) : null;

      if (!target) {
        return;
      }

      const text = target.textContent || "";

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          fallbackCopy(text);
        }
        button.textContent = "Copied";
      } catch (error) {
        fallbackCopy(text);
        button.textContent = "Copied";
      }

      window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1600);
    });
  });
}

function setupBibtexToggle() {
  const tabs = document.querySelectorAll("[data-bibtex-tab]");
  const snippets = document.querySelectorAll(".bibtex-snippet");
  const copyButton = document.querySelector(".bibtex-panel .copy-button");

  if (!tabs.length || !snippets.length || !copyButton) {
    return;
  }

  function activate(key) {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.bibtexTab === key;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    snippets.forEach((snippet) => {
      const isActive = snippet.id === `bibtex-snippet-${key}`;
      snippet.hidden = !isActive;
      snippet.classList.toggle("is-active", isActive);
    });

    copyButton.setAttribute("data-copy-target", `bibtex-snippet-${key}`);
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.dataset.bibtexTab;

      if (!key) {
        return;
      }

      activate(key);
    });
  });
}

setupArxivLinks();
setupReveal();
setupMetricAnimations();
setupLightbox();
setupCopyButtons();
setupBibtexToggle();
