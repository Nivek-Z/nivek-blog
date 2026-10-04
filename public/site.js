(function () {
  function initArticleSurface() {
    var path = window.location.pathname;
    var isHome = path === "/" || path === "/index.html";
    var plain = path === "/photos" || path === "/archives" || path === "/archives/";
    if (isHome || plain) return;
    document.querySelectorAll(".entry-content").forEach(function (el) {
      el.classList.add("article-protected-bg");
    });
  }

  function closeNav() {
    document.querySelectorAll(".container, .site-nav-toggle, .site-sidebar").forEach(function (el) {
      el.classList.remove("open");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initArticleSurface();
    var header = document.querySelector(".site-header");
    var last = window.scrollY;
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (header) {
        header.classList.toggle("yya", y !== 0);
        if (y > last) header.classList.remove("sabit");
        else header.classList.add("sabit");
      }
      last = y;
    }, { passive: true });

    var toggle = document.querySelector(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        document.querySelectorAll(".container, .site-nav-toggle, .site-sidebar").forEach(function (el) {
          el.classList.add("open");
        });
      });
    }
    var closer = document.querySelector(".sidebar-close");
    if (closer) closer.addEventListener("click", function (event) {
      event.preventDefault();
      closeNav();
    });

    document.querySelectorAll(".theme-change-js").forEach(function (el) {
      el.addEventListener("click", function () {
        var menu = document.querySelector(".skin-menu");
        if (menu) menu.classList.toggle("show");
      });
    });
    document.querySelectorAll(".skin-menu .menu-item").forEach(function (el) {
      el.addEventListener("click", function () {
        var data = {};
        try { data = JSON.parse(el.getAttribute("data-item") || "{}"); } catch (e) {}
        if (data.bg_url) document.body.style.backgroundImage = "url(" + data.bg_url + ")";
        else document.body.style.backgroundImage = "";
        document.body.classList.toggle("dark", !!data.bg_night);
        document.body.style.backgroundSize = data.bg_img_strategy === "cover" ? "cover" : "auto";
        if (data.bg_img_strategy === "repeat" || data.bg_img_strategy === "no-repeat") {
          document.body.style.backgroundRepeat = data.bg_img_strategy;
        }
        var menu = document.querySelector(".skin-menu");
        if (menu) menu.classList.remove("show");
      });
    });

    var top = document.querySelector(".m-cd-top");
    if (top) top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    var down = document.querySelector(".headertop-down");
    if (down) down.addEventListener("click", function () {
      var content = document.getElementById("content");
      if (content) content.scrollIntoView({ behavior: "smooth" });
    });

    initTocSpy();
    initArchives();
    initPostToasts();
    initPhotos();
  });

  function unit(count, one, other) {
    return count + " " + (count === 1 ? one : other);
  }

  function secondToTimeString(second) {
    var minutes = Math.floor(second / 60);
    var seconds = second % 60;
    var hours = Math.floor(minutes / 60);
    minutes %= 60;
    var days = Math.floor(hours / 24);
    hours %= 24;
    var parts = [];
    if (days > 0) parts.push(unit(days, "day", "days"));
    if (hours > 0) parts.push(unit(hours, "hour", "hours"));
    if (minutes > 0) parts.push(unit(minutes, "minute", "minutes"));
    if (seconds > 0) parts.push(unit(seconds, "second", "seconds"));
    return parts.join(" ");
  }

  function relativeTime(timestamp) {
    var diffInSeconds = Math.round((Date.now() - timestamp) / 1000);
    var rtf = new Intl.RelativeTimeFormat("en", { style: "long" });
    if (diffInSeconds < 60) return rtf.format(-diffInSeconds, "second");
    if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), "minute");
    if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), "hour");
    if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), "day");
    if (diffInSeconds < 31104000) return rtf.format(-Math.floor(diffInSeconds / 2592000), "month");
    return rtf.format(-Math.floor(diffInSeconds / 31104000), "year");
  }

  function wordCount(el) {
    var pattern = /\p{Script=Han}|\p{Script=Kana}|\p{Script=Hira}|\p{Script=Hangul}|[\p{L}|\p{N}|._]+/gu;
    var text = (el.textContent || "").normalize();
    var match = text.match(pattern);
    return match ? match.length : 0;
  }

  function toastType(kind, amount) {
    if (kind === "read") {
      if (amount <= 60 * 10) return "NORMAL";
      if (amount <= 60 * 30) return "MEDIUM";
      return "DIFFICULTY";
    }
    var month = 1000 * 60 * 60 * 24 * 30;
    if (amount <= month) return "NORMAL";
    if (amount <= month * 3) return "MEDIUM";
    return "DIFFICULTY";
  }

  function createPostToast(parent, message, type, className) {
    if (parent.querySelector("." + className)) return;
    var colors = {
      NORMAL: "rgba(167, 210, 226, 1)",
      MEDIUM: "rgba(255, 197, 160, 1)",
      DIFFICULTY: "rgba(239, 206, 201, 1)"
    };
    var toast = document.createElement("div");
    toast.className = className + " minicode";
    toast.style.backgroundColor = colors[type];
    var content = document.createElement("span");
    content.className = "content-toast";
    content.innerHTML = message;
    var hide = document.createElement("div");
    hide.className = "hide-minicode flex-child-center";
    hide.innerHTML = '<span class="iconify iconify--small" data-icon="ic:sharp-close">×</span>';
    hide.addEventListener("click", function () { toast.classList.add("hide"); }, { once: true });
    toast.appendChild(content);
    toast.appendChild(hide);
    parent.insertAdjacentElement("afterbegin", toast);
  }

  function initPostToasts() {
    document.querySelectorAll(".hide-minicode").forEach(function (hide) {
      if (hide.getAttribute("data-bound")) return;
      hide.setAttribute("data-bound", "1");
      hide.addEventListener("click", function () {
        var toast = hide.closest(".minicode");
        if (toast) toast.classList.add("hide");
      }, { once: true });
    });
    var content = document.querySelector(".entry-content");
    if (!content) return;
    var article = content.closest("article");
    var modifyRaw = article ? article.getAttribute("data-last-modify") : "";
    var count = wordCount(content);
    var wide = window.innerWidth > 860;

    if (count > 0) {
      var seconds = Math.ceil((count / 600) * 60);
      var readType = toastType("read", seconds);
      var readRemind = "";
      if (wide) {
        readRemind = {
          NORMAL: "This post is of average length, and can be read with peace of mind.",
          MEDIUM: "This post is very long, it is recommended to read it in paragraphs.",
          DIFFICULTY: "The content of this post is very outdated and may no longer apply!"
        }[readType];
      }
      var timeString = secondToTimeString(seconds);
      createPostToast(
        content,
        "This post has a total of <b>" + count + "</b> words, and is expected to take <b> " + timeString + "</b> to read." + readRemind,
        readType,
        "word_count"
      );
    }

    if (!modifyRaw) return;
    var edited = new Date(modifyRaw);
    if (Number.isNaN(edited.getTime())) return;
    var elapsed = Date.now() - edited.getTime();
    var editType = toastType("edit", elapsed);
    var editRemind = "";
    if (wide) {
      editRemind = {
        NORMAL: "This post was recently updated, so feel free to read it with confidence!",
        MEDIUM: "This post has not been updated for a long time, so it may no longer apply.",
        DIFFICULTY: "The content of this post is very outdated and may no longer apply!"
      }[editType];
    }
    createPostToast(
      content,
      "The last time this post was edited was <b>" + relativeTime(edited.getTime()) + "</b>." + editRemind,
      editType,
      "last_time"
    );
  }

  function initTocSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".toc a.toc-link"));
    if (!links.length) return;
    var items = links.map(function (link) {
      var href = link.getAttribute("href") || "";
      var id = href.charAt(0) === "#" ? href.slice(1) : href;
      var el = document.getElementById(id);
      if (!el) {
        try { el = document.getElementById(decodeURIComponent(id)); } catch (e) {}
      }
      return el ? { link: link, el: el } : null;
    }).filter(Boolean);
    if (!items.length) return;
    var headerOffset = 75;
    function update() {
      var current = items[0];
      var marker = window.scrollY + headerOffset + 8;
      for (var i = 0; i < items.length; i++) {
        var top = items[i].el.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) current = items[i];
      }
      items.forEach(function (item) {
        item.link.classList.toggle("is-active-link", item === current);
        if (item.link.parentElement) {
          item.link.parentElement.classList.toggle("is-active-li", item === current);
        }
      });
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initPhotos() {
    var gallery = document.querySelector(".masonry-gallery");
    if (!gallery) return;
    document.querySelectorAll("#gallery-filter span").forEach(function (span) {
      span.addEventListener("click", function () {
        document.querySelectorAll("#gallery-filter span").forEach(function (item) {
          item.classList.remove("active");
        });
        span.classList.add("active");
        var filter = span.getAttribute("data-filter") || "*";
        gallery.querySelectorAll(".gallery-item").forEach(function (item) {
          var show = filter === "*" || item.matches(filter);
          item.classList.toggle("is-filtered-out", !show);
        });
      });
    });
    document.querySelectorAll("#grid-changer span").forEach(function (span) {
      span.addEventListener("click", function () {
        document.querySelectorAll("#grid-changer span").forEach(function (item) {
          item.classList.remove("active");
        });
        span.classList.add("active");
        var col = span.getAttribute("data-col");
        gallery.classList.toggle("columns-5", col === "5");
        gallery.classList.toggle("columns-3", col !== "5");
      });
    });
  }

  function initArchives() {
    document.querySelectorAll(".archives-article .archive-title h3").forEach(function (element) {
      element.addEventListener("click", function () {
        var archiveElement = element.parentElement && element.parentElement.parentElement;
        if (!archiveElement) return;
        var posts = archiveElement.querySelector(".archive-posts");
        if (!posts) return;
        if (archiveElement.classList.contains("active")) {
          posts.style.maxHeight = posts.scrollHeight + "px";
          posts.style.maxHeight = "0";
          archiveElement.classList.remove("active");
        } else {
          archiveElement.classList.add("active");
          posts.style.maxHeight = posts.scrollHeight + "px";
        }
      });
    });
  }
})();
