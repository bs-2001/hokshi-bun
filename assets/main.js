/* ============================================
   Default Theme — Interactions
   ============================================ */

(function () {
  "use strict";

  // --- Load highlight CSS dynamically ---
  (function () {
    var schemeLink = document.querySelector('link[href*="scheme-"]');
    var basePath = schemeLink
      ? schemeLink.getAttribute("href").replace(/\/assets\/scheme-.*$/, "")
      : "";
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = basePath + "/assets/highlight.css";
    document.head.appendChild(link);
  })();

  // --- Available color schemes (extend by adding new names & preview colors) ---
  var SCHEMES = [
    { id: "green", label: "Green", accent: "#04ca15", bg: "#edf2e6", darkBg: "#1a2e1a" },
    { id: "red", label: "Red", accent: "#ca3e04", bg: "#fefaf8", darkBg: "#2e1a1a" },
    { id: "blue", label: "Blue", accent: "#2563eb", bg: "#eef2ff", darkBg: "#0f172a" },
    { id: "sand", label: "Sand", accent: "#b8860b", bg: "#fdf6e3", darkBg: "#1a1610" },
    { id: "pink", label: "Pink", accent: "#d946ef", bg: "#fdf4ff", darkBg: "#1f0a24" },
    { id: "cyan", label: "Cyan", accent: "#0891b2", bg: "#ecfeff", darkBg: "#042f3b" },
    { id: "coffee", label: "Coffee", accent: "#7c4a28", bg: "#faf3eb", darkBg: "#1c130b" },
  ];

  // --- Nav active fallback ---
  if (!document.querySelector(".nav-link.active")) {
    var homeLink =
      document.querySelector('.nav-link[href$="/"]') || document.querySelector(".nav-link");
    if (homeLink) homeLink.classList.add("active");
  }

  // --- Dark Mode ---
  var htmlEl = document.documentElement;

  function getPreferredTheme() {
    var stored = localStorage.getItem("theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      htmlEl.classList.add("dark");
    } else {
      htmlEl.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }

  applyTheme(getPreferredTheme());

  var systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  systemThemeQuery.addEventListener("change", function () {
    if (!localStorage.getItem("theme")) {
      applyTheme(systemThemeQuery.matches ? "dark" : "light");
    }
  });

  document.querySelectorAll(".theme-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = htmlEl.classList.contains("dark") ? "light" : "dark";
      applyTheme(next);
    });
  });

  // --- Color Scheme: shared state ---
  var schemeLink = document.querySelector('link[href*="scheme-"]');

  function getSchemeId() {
    var stored = localStorage.getItem("scheme");
    if (stored) return stored;
    if (schemeLink) {
      var m = schemeLink.getAttribute("href").match(/scheme-(\w+)\.css/);
      if (m) return m[1];
    }
    return SCHEMES[0].id;
  }

  function applyScheme(id) {
    if (!schemeLink) return;
    var oldHref = schemeLink.getAttribute("href");
    var prefix = oldHref.substring(0, oldHref.lastIndexOf("scheme-"));
    schemeLink.setAttribute("href", prefix + "scheme-" + id + ".css");
    localStorage.setItem("scheme", id);
    // Update data attribute on all scheme buttons
    document.querySelectorAll(".scheme-btn").forEach(function (btn) {
      btn.setAttribute("data-scheme", id);
    });
    // Update active state in all pickers
    document.querySelectorAll(".scheme-swatch").forEach(function (sw) {
      sw.classList.toggle("active", sw.getAttribute("data-scheme") === id);
    });
  }

  // Apply persisted scheme on load
  applyScheme(getSchemeId());

  // --- Build scheme swatches & populate popup + picker ---
  function buildSwatch(scheme, activeId) {
    var div = document.createElement("div");
    div.className = "scheme-swatch" + (scheme.id === activeId ? " active" : "");
    div.setAttribute("data-scheme", scheme.id);
    div.setAttribute("role", "button");
    div.setAttribute("tabindex", "0");
    div.setAttribute("title", scheme.label);

    // Color preview bar: light bg | accent | dark bg
    var bar = document.createElement("div");
    bar.className = "scheme-swatch-bar";
    bar.innerHTML =
      '<span style="background:' +
      scheme.bg +
      '"></span>' +
      '<span style="background:' +
      scheme.accent +
      '"></span>' +
      '<span style="background:' +
      scheme.darkBg +
      '"></span>';
    div.appendChild(bar);

    var label = document.createElement("span");
    label.className = "scheme-swatch-label";
    label.textContent = scheme.label;
    div.appendChild(label);

    div.addEventListener("click", function () {
      applyScheme(scheme.id);
      closeAllPopups();
    });

    return div;
  }

  var activeId = getSchemeId();
  var popupGrid = document.getElementById("scheme-popup-grid");

  if (popupGrid) {
    SCHEMES.forEach(function (s) {
      popupGrid.appendChild(buildSwatch(s, activeId));
    });
  }

  // --- Popup toggle ---
  var schemeToggle = document.getElementById("scheme-toggle");
  var schemePopup = document.getElementById("scheme-popup");

  if (schemeToggle && schemePopup) {
    schemeToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      schemePopup.classList.toggle("active");
    });
  }

  // --- Close popup on outside click ---
  function closeAllPopups() {
    if (schemePopup) schemePopup.classList.remove("active");
  }

  document.addEventListener("click", function (e) {
    if (schemePopup && schemePopup.classList.contains("active")) {
      // Don't close if clicking inside the popup or the toggle button
      if (
        !schemePopup.contains(e.target) &&
        e.target !== schemeToggle &&
        !schemeToggle.contains(e.target)
      ) {
        schemePopup.classList.remove("active");
      }
    }
  });

  // Close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllPopups();
  });

  // --- Mobile Drawer ---
  var menuToggle = document.getElementById("menu-toggle");
  var drawer = document.getElementById("mobile-drawer");
  var overlay = document.getElementById("mobile-overlay");
  var drawerClose = document.getElementById("drawer-close");

  function openDrawer() {
    if (drawer) drawer.classList.add("active");
    if (overlay) overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (menuToggle) menuToggle.addEventListener("click", openDrawer);
  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer && drawer.classList.contains("active")) {
      closeDrawer();
    }
  });

  if (drawer) {
    drawer.querySelectorAll(".drawer-nav a").forEach(function (link) {
      link.addEventListener("click", closeDrawer);
    });
  }

  // --- htmx: scroll to top after pagination swap ---
  document.body.addEventListener("htmx:afterSettle", function () {
    if (document.getElementById("post-list-wrap")) {
      setTimeout(function () {
        var btn = document.getElementById("back-to-top");
        if (btn) btn.click();
      }, 300);
    }
  });

  // --- Back to top ---
  var backBtn = document.getElementById("back-to-top");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // --- Lightbox for post images ---
  (function () {
    var overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.innerHTML =
      '<button class="lightbox-close" aria-label="Close">✕</button>' +
      '<img class="lightbox-img" src="" alt="">';
    document.body.appendChild(overlay);

    var imgEl = overlay.querySelector(".lightbox-img");
    var closeBtn = overlay.querySelector(".lightbox-close");

    function open(src) {
      imgEl.src = src;
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    // Close on overlay background click (not on image)
    overlay.addEventListener("click", close);
    closeBtn.addEventListener("click", close);

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("open")) close();
    });

    // Delegate click on images inside post-content
    document.addEventListener("click", function (e) {
      var img = e.target.closest("#post-content img");
      if (img && !img.closest("a")) {
        e.preventDefault();
        open(img.src);
      }
    });
  })();

  // --- TOC: Tree-structured table of contents for post pages ---
  var postWithToc = document.getElementById("post-with-toc");
  var postContent = document.getElementById("post-content");
  var tocListWrap = document.getElementById("toc-list-wrap");

  if (postContent && tocListWrap && postWithToc) {
    // 1. Collect all headings h1-h6 and assign stable IDs
    var headings = postContent.querySelectorAll("h1, h2, h3, h4, h5, h6");
    var tocSidebar = document.getElementById("toc-sidebar");

    if (headings.length > 0) {
      headings.forEach(function (heading, index) {
        if (!heading.id) heading.id = "toc-heading-" + index;
      });

      // 2. Build a tree from flat heading list
      function buildTree(nodes) {
        var root = [];
        var stack = [{ level: 0, children: root }];
        for (var i = 0; i < nodes.length; i++) {
          var level = parseInt(nodes[i].tagName.substring(1));
          var node = {
            level: level,
            id: nodes[i].id,
            text: nodes[i].textContent,
            el: nodes[i],
            children: [],
          };
          while (stack[stack.length - 1].level >= level) stack.pop();
          stack[stack.length - 1].children.push(node);
          stack.push(node);
        }
        return root;
      }

      // 3. Render tree as nested <ul>
      function renderTree(tree, indent) {
        if (tree.length === 0) return "";
        var html = '<ul class="toc-level">';
        for (var i = 0; i < tree.length; i++) {
          var n = tree[i];
          html += '<li class="toc-item toc-l' + n.level + '" data-toc-id="' + n.id + '">';
          html += '<a href="#' + n.id + '" class="toc-link">' + n.text + "</a>";
          html += renderTree(n.children, indent + 1);
          html += "</li>";
        }
        html += "</ul>";
        return html;
      }

      var tree = buildTree(Array.prototype.slice.call(headings));
      tocListWrap.innerHTML = renderTree(tree, 0);

      // 4. Scroll tracking via IntersectionObserver
      var tocLinks = tocListWrap.querySelectorAll(".toc-link");
      var activeLink = null;

      function setActive(id) {
        tocLinks.forEach(function (link) {
          var li = link.parentNode;
          var isActive = li.getAttribute("data-toc-id") === id;
          li.classList.toggle("toc-active", isActive);
          if (isActive) activeLink = link;
        });
      }

      var observer = new IntersectionObserver(
        function (entries) {
          var visible = [];
          entries.forEach(function (entry) {
            if (entry.isIntersecting) visible.push(entry.target.id);
          });
          if (visible.length > 0) {
            setActive(visible[visible.length - 1]);
          } else {
            var scrollY = window.scrollY + 120;
            var best = null;
            for (var i = headings.length - 1; i >= 0; i--) {
              var rect = headings[i].getBoundingClientRect();
              var absTop = rect.top + window.scrollY;
              if (absTop <= scrollY) {
                best = headings[i].id;
                break;
              }
            }
            if (best) setActive(best);
          }
        },
        {
          rootMargin: "-80px 0px -60% 0px",
          threshold: 0,
        },
      );

      headings.forEach(function (h) {
        observer.observe(h);
      });

      // 5. Smooth scroll on TOC link click
      tocListWrap.addEventListener("click", function (e) {
        var link = e.target.closest(".toc-link");
        if (link) {
          e.preventDefault();
          var targetId = link.getAttribute("href").substring(1);
          var target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            setActive(targetId);
            history.replaceState(null, "", "#" + targetId);
          }
        }
      });
    } else if (tocSidebar) {
      tocSidebar.style.display = "none";
    }
  }
})();
