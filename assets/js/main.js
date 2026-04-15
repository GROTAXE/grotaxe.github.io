const root = document.documentElement;
const storageKey = "grotaxe-theme";
const menuToggle = document.querySelector(".menu-toggle");
const themeButtons = document.querySelectorAll("[data-theme-toggle]");
const sectionLinks = document.querySelectorAll("[data-section-link]");
const revealItems = document.querySelectorAll("[data-reveal]");
const currentYearTargets = document.querySelectorAll("[data-current-year]");
const metaThemeColor = document.querySelector('meta[name="theme-color"]');

function preferredTheme() {
  const savedTheme = localStorage.getItem(storageKey);

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem(storageKey, theme);

  themeButtons.forEach((button) => {
    const label = button.querySelector("[data-theme-label]");

    if (label) {
      label.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    }

    const nextTheme = theme === "dark" ? "light" : "dark";
    button.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
  });

  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", theme === "dark" ? "#0d0f11" : "#f3efe8");
  }
}

function toggleTheme() {
  const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
}

function setCurrentYear() {
  const year = new Date().getFullYear();
  currentYearTargets.forEach((node) => {
    node.textContent = year;
  });
}

function closeMenu() {
  document.body.classList.remove("nav-open");

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
  }
}

function bindMenu() {
  if (!menuToggle) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    document.body.classList.toggle("nav-open", !expanded);
  });

  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("nav-open")) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (!target.closest(".site-header")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      closeMenu();
    }
  });
}

function bindTheme() {
  themeButtons.forEach((button) => {
    button.addEventListener("click", toggleTheme);
  });
}

function bindSectionLinks() {
  sectionLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });
}

function revealOnScroll() {
  if (!revealItems.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("revealed");
        instance.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -12% 0px",
    }
  );

  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min(index * 40, 180)}ms`);
    observer.observe(item);
  });
}

function highlightSections() {
  if (!sectionLinks.length || document.body.dataset.page !== "home") {
    return;
  }

  const sections = Array.from(sectionLinks)
    .map((link) => document.getElementById(link.dataset.sectionLink))
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) {
    return;
  }

  const activate = (id) => {
    sectionLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.sectionLink === id);
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

      if (visible[0]?.target.id) {
        activate(visible[0].target.id);
      }
    },
    {
      threshold: [0.2, 0.45, 0.7],
      rootMargin: "-25% 0px -50% 0px",
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

applyTheme(preferredTheme());
bindMenu();
bindTheme();
bindSectionLinks();
revealOnScroll();
highlightSections();
setCurrentYear();
