/* ============================================
   Ink Theme — Interactions
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

  // --- Nav active fallback ---
  if (!document.querySelector(".nav-link.active")) {
    var currentPath = location.pathname;
    var found = false;

    document.querySelectorAll(".nav-link").forEach(function (link) {
      if (found) return;
      var href = link.getAttribute("href");
      if (!href) return;

      if (href === currentPath) {
        found = true;
        link.classList.add("active");
        return;
      }

      if (
        href === "/" &&
        (currentPath === "/index.html" || currentPath === "/")
      ) {
        found = true;
        link.classList.add("active");
        return;
      }

      if (/\/pages\/\d+\.html$/.test(href) && /\/pages\/\d+\.html$/.test(currentPath)) {
        found = true;
        link.classList.add("active");
      }
    });

    if (!found) {
      var homeLink =
        document.querySelector('.nav-link[href$="/"]') || document.querySelector(".nav-link");
      if (homeLink) homeLink.classList.add("active");
    }
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

    overlay.addEventListener("click", close);
    closeBtn.addEventListener("click", close);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("open")) close();
    });

    document.addEventListener("click", function (e) {
      var img = e.target.closest("#post-content img");
      if (img && !img.closest("a")) {
        e.preventDefault();
        open(img.src);
      }
    });
  })();

  // --- TOC: in-sidebar table of contents for post pages ---
  var postContent = document.getElementById("post-content");
  var tocListWrap = document.getElementById("toc-list-wrap");
  var tocSidebar = document.getElementById("toc-sidebar");

  if (postContent && tocListWrap && tocSidebar) {
    // 1. Collect all headings h1-h6 and assign stable IDs
    var headings = postContent.querySelectorAll("h1, h2, h3, h4, h5, h6");

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
      function renderTree(tree) {
        if (tree.length === 0) return "";
        var html = '<ul class="toc-level">';
        for (var i = 0; i < tree.length; i++) {
          var n = tree[i];
          html += '<li class="toc-item toc-l' + n.level + '" data-toc-id="' + n.id + '">';
          html += '<a href="#' + n.id + '" class="toc-link">' + n.text + "</a>";
          html += renderTree(n.children);
          html += "</li>";
        }
        html += "</ul>";
        return html;
      }

      var tree = buildTree(Array.prototype.slice.call(headings));
      tocListWrap.innerHTML = renderTree(tree);

      // 4. Scroll tracking via IntersectionObserver
      var tocLinks = tocListWrap.querySelectorAll(".toc-link");

      function setActive(id) {
        tocLinks.forEach(function (link) {
          var li = link.parentNode;
          var isActive = li.getAttribute("data-toc-id") === id;
          li.classList.toggle("toc-active", isActive);
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
    } else {
      tocSidebar.style.display = "none";
    }
  } else if (tocSidebar) {
    tocSidebar.style.display = "none";
  }
})();
