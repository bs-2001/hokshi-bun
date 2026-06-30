(function () {
  var data = window.__gallery;
  var categories = data.categories;
  var photos = data.photos;

  var currentCategory = categories[0].id;
  var currentIndex = 0;
  var autoplayTimer = null;
  var flatList = [];

  function buildFlatList(catId) {
    flatList = [];
    for (var i = 0; i < photos.length; i++) {
      if (photos[i].category === catId) {
        flatList.push(i);
      }
    }
  }

  function getCatIndexInFlat(catId, globalIdx) {
    buildFlatList(catId);
    return flatList.indexOf(globalIdx);
  }

  function getGlobalIndex(catId, catIdx) {
    buildFlatList(catId);
    return flatList[catIdx];
  }

  // ---- Category tabs ----
  function switchCategory(catId) {
    currentCategory = catId;
    currentIndex = 0;
    var items = document.querySelectorAll(".gallery-cat-item");
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle("active", items[i].getAttribute("data-cat") === catId);
    }
    renderThumbnails(catId);
  }

  var catItems = document.querySelectorAll(".gallery-cat-item");
  for (var i = 0; i < catItems.length; i++) {
    catItems[i].addEventListener("click", function () {
      switchCategory(this.getAttribute("data-cat"));
    });
  }

  // ---- Thumbnails ----
  function renderThumbnails(catId) {
    var grid = document.getElementById("gallery-grid");
    var html = "";
    buildFlatList(catId);
    for (var i = 0; i < flatList.length; i++) {
      var p = photos[flatList[i]];
      html +=
        '<div class="gallery-thumb" style="background-image:url(' +
        sitePath() +
        'gallery/thumbs/' +
        p.id +
        '.jpg)" data-index="' +
        flatList[i] +
        '">' +
        '<span class="gallery-thumb-title">' +
        escapeHtml(p.title) +
        "</span>" +
        "</div>";
    }
    grid.innerHTML = html;

    var thumbs = grid.querySelectorAll(".gallery-thumb");
    for (var j = 0; j < thumbs.length; j++) {
      thumbs[j].addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-index"));
        openLightbox(idx);
      });
    }
  }

  function sitePath() {
    return window.__galleryPath || "/";
  }

  // ---- Lightbox ----
  function openLightbox(globalIdx) {
    currentIndex = globalIdx;
    currentCategory = photos[globalIdx].category;
    showPhoto(globalIdx);
    // Reset body expand state
    var bodyWrap = document.getElementById("gallery-lightbox-body-wrap");
    bodyWrap.classList.remove("expanded");
    document.getElementById("gallery-lightbox").classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function showPhoto(globalIdx) {
    var p = photos[globalIdx];
    var catIdx = getCatIndexInFlat(p.category, globalIdx);
    var totalInCat = flatList.length;

    var imageEl = document.getElementById("gallery-lightbox-image");
    imageEl.style.backgroundImage =
      "url(" + sitePath() + "gallery/photos/" + p.id + ".jpg)";

    document.getElementById("gallery-lightbox-title").textContent = p.title;
    document.getElementById("gallery-lightbox-desc").textContent = p.desc;
    document.getElementById("gallery-lightbox-counter").textContent =
      catIdx + 1 + " / " + totalInCat;

    var bodyEl = document.getElementById("gallery-lightbox-body");
    var bodyHtml = document.getElementById("gallery-body-" + p.id);
    bodyEl.innerHTML = bodyHtml ? bodyHtml.innerHTML : "";

    var catName = "";
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].id === p.category) {
        catName = categories[i].name;
        break;
      }
    }
    document.getElementById("gallery-lightbox-cat").textContent = catName;

    // Show/hide expand button based on content
    var expandBtn = document.getElementById("gallery-lightbox-expand");
    if (bodyEl.innerHTML.trim()) {
      expandBtn.style.display = "flex";
    } else {
      expandBtn.style.display = "none";
    }

    // Prev/Next visibility
    var totalCategories = categories.length;
    var catIndex = -1;
    for (var j = 0; j < totalCategories; j++) {
      if (categories[j].id === p.category) {
        catIndex = j;
        break;
      }
    }

    var prevBtn = document.getElementById("gallery-prev");
    var nextBtn = document.getElementById("gallery-next");

    if (catIdx === 0 && catIndex === 0) {
      prevBtn.style.visibility = "hidden";
    } else {
      prevBtn.style.visibility = "visible";
    }

    if (catIdx === totalInCat - 1 && catIndex === totalCategories - 1) {
      nextBtn.style.visibility = "hidden";
    } else {
      nextBtn.style.visibility = "visible";
    }
  }

  function galleryToggleBody() {
    document.getElementById("gallery-lightbox-body-wrap").classList.toggle("expanded");
  }

  function galleryClose() {
    document.getElementById("gallery-lightbox").classList.remove("active");
    document.body.style.overflow = "";
    clearInterval(autoplayTimer);
    autoplayTimer = null;
    document.getElementById("gallery-progress").classList.remove("running");
    document.getElementById("gallery-prev").style.opacity = "";
    document.getElementById("gallery-next").style.opacity = "";
    document.getElementById("gallery-lightbox-body-wrap").classList.remove("expanded");
  }

  function galleryPrev() {
    var p = photos[currentIndex];
    var catIdx = getCatIndexInFlat(p.category, currentIndex);

    if (catIdx > 0) {
      currentIndex = getGlobalIndex(p.category, catIdx - 1);
    } else {
      var totalCategories = categories.length;
      var catIndex = -1;
      for (var i = 0; i < totalCategories; i++) {
        if (categories[i].id === p.category) {
          catIndex = i;
          break;
        }
      }
      if (catIndex > 0) {
        var prevCat = categories[catIndex - 1].id;
        buildFlatList(prevCat);
        currentIndex = flatList[flatList.length - 1];
      }
    }
    showPhoto(currentIndex);
  }

  function galleryNext() {
    var p = photos[currentIndex];
    var catIdx = getCatIndexInFlat(p.category, currentIndex);

    if (catIdx < flatList.length - 1) {
      currentIndex = getGlobalIndex(p.category, catIdx + 1);
    } else {
      var totalCategories = categories.length;
      var catIndex = -1;
      for (var i = 0; i < totalCategories; i++) {
        if (categories[i].id === p.category) {
          catIndex = i;
          break;
        }
      }
      if (catIndex < totalCategories - 1) {
        var nextCat = categories[catIndex + 1].id;
        buildFlatList(nextCat);
        currentIndex = flatList[0];
      }
    }
    showPhoto(currentIndex);
  }

  // ---- Auto-play ----
  function galleryAutoPlay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
      document.getElementById("gallery-progress").classList.remove("running");
      document.getElementById("gallery-prev").style.opacity = "";
      document.getElementById("gallery-next").style.opacity = "";
      return;
    }

    document.getElementById("gallery-prev").style.opacity = "0";
    document.getElementById("gallery-next").style.opacity = "0";
    document.getElementById("gallery-progress").classList.add("running");

    if (!document.getElementById("gallery-lightbox").classList.contains("active")) {
      openLightbox(getGlobalIndex(currentCategory, 0));
    }

    autoplayTimer = setInterval(function () {
      var nextBtn = document.getElementById("gallery-next");
      if (nextBtn.style.visibility !== "hidden") {
        galleryNext();
      } else {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
        document.getElementById("gallery-progress").classList.remove("running");
        document.getElementById("gallery-prev").style.opacity = "";
        document.getElementById("gallery-next").style.opacity = "";
      }
    }, 5000);
  }

  // ---- Keyboard ----
  document.addEventListener("keydown", function (e) {
    var lb = document.getElementById("gallery-lightbox");
    if (!lb.classList.contains("active")) return;
    if (e.key === "ArrowLeft") galleryPrev();
    if (e.key === "ArrowRight") galleryNext();
    if (e.key === "Escape") galleryClose();
  });

  // Expose to global scope
  window.galleryAutoPlay = galleryAutoPlay;
  window.galleryPrev = galleryPrev;
  window.galleryNext = galleryNext;
  window.galleryClose = galleryClose;
  window.galleryToggleBody = galleryToggleBody;

  // ---- Init ----
  switchCategory(currentCategory);
})();

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
