/* Renders every page from window.StudyPath (js/courses.js).
   Both scripts use defer and run in document order.
   courses.js shapes are read-only.

   The document is the only scroll root. Do not move scrolling
   onto .page, and do not call scrollTo while toggling a bar.
   A return link may be position:fixed. It must not change overflow. */
(function () {
  var source = window.StudyPath;
  var page = document.body.getAttribute("data-page") || "home";
  var ORIGIN = "https://learn-backend-and-ai.vercel.app";
  var NEW_DAYS = 14;
  var PREVIEW = 3;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var levels = {
    b: ["Beginner", "b-beg"],
    i: ["Intermediate", "b-int"],
    a: ["Advanced", "b-adv"],
    n: ["", ""]
  };
  var levelWords = { b: "beginner", i: "intermediate", a: "advanced", n: "" };

  if (!source || !source.data) return;

  var data = source.data;
  var picks = Array.isArray(source.picks) ? source.picks : [];
  var slugs = buildSlugs(data);
  var untilFound = (function () {
    var probe = document.createElement("div");
    try { probe.hidden = "until-found"; } catch (error) { return false; }
    return probe.hidden === "until-found";
  })();

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function buildSlugs(tracks) {
    var used = {};
    return tracks.map(function (track) {
      var base = slugify(track.cat) || "subject";
      var slug = base;
      var n = 2;
      while (used[slug]) {
        slug = base + "-" + n;
        n += 1;
      }
      used[slug] = true;
      return slug;
    });
  }

  function uniqueIds(names) {
    var used = {};
    return names.map(function (name, index) {
      var base = "cat-" + (slugify(name) || String(index + 1));
      var id = base;
      var n = 2;
      while (used[id]) {
        id = base + "-" + n;
        n += 1;
      }
      used[id] = true;
      return id;
    });
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function countSentence(count, singular, plural) {
    return count + " " + (count === 1 ? singular : plural);
  }

  function parseDay(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    var year = Number(value.slice(0, 4));
    var month = Number(value.slice(5, 7));
    var day = Number(value.slice(8, 10));
    var utc = Date.UTC(year, month - 1, day);
    var check = new Date(utc);
    if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
    return utc;
  }

  function formatDate(value) {
    if (parseDay(value) === null) return "";
    return Number(value.slice(8, 10)) + " " + MONTHS[Number(value.slice(5, 7)) - 1] + " " + value.slice(0, 4);
  }

  function isNew(value) {
    var added = parseDay(value);
    if (added === null) return false;
    var now = new Date();
    var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var diff = Math.round((today - added) / 86400000);
    return diff >= 0 && diff <= NEW_DAYS;
  }

  function publicDescription(text) {
    if (!text) return "";
    var cleaned = String(text).replace(/\s*\(subject line only\)/ig, " ").replace(/\s+/g, " ").trim();
    cleaned = cleaned.replace(/\s+\./g, ".").replace(/^\.\s*/, "").trim();
    return cleaned;
  }

  function safeUrl(url) {
    if (typeof url !== "string") return "";
    var trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) return "";
    return trimmed;
  }

  function setContent(selector, value) {
    var node = document.querySelector(selector);
    if (node) node.setAttribute("content", value);
  }

  function setPageMeta(title, description, path) {
    document.title = title;
    var url = ORIGIN + path;
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", description);
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);
    setContent('meta[property="og:url"]', url);
    setContent('meta[property="og:title"]', title);
    setContent('meta[property="og:description"]', description);
    setContent('meta[name="twitter:title"]', title);
    setContent('meta[name="twitter:description"]', description);
    setContent('meta[property="og:image"]', ORIGIN + "/assets/og.png");
    setContent('meta[name="twitter:image"]', ORIGIN + "/assets/og.png");
  }

  function setRobots(value) {
    var robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", value);
  }

  function itemsOf(track) {
    var list = [];
    (track.groups || []).forEach(function (group) {
      (group.items || []).forEach(function (item) {
        if (item && item[0]) list.push(item);
      });
    });
    return list;
  }

  function tally(items) {
    var linked = 0;
    items.forEach(function (item) {
      if (safeUrl(item[4])) linked += 1;
    });
    return { linked: linked, waiting: items.length - linked, total: items.length };
  }

  function picksIndex() {
    var i;
    for (i = 0; i < data.length; i += 1) {
      if (data[i].cat === "Back-end") return i;
    }
    return 0;
  }

  function firstItem(track) {
    var found = null;
    (track.groups || []).some(function (group) {
      return (group.items || []).some(function (item) {
        if (item && item[0]) {
          found = item;
          return true;
        }
        return false;
      });
    });
    return found;
  }

  function findTrack(slug) {
    var i;
    for (i = 0; i < data.length; i += 1) {
      if (slugs[i] === slug) return { track: data[i], index: i, slug: slugs[i] };
    }
    return null;
  }

  function currentSlug() {
    var parts = location.pathname.split("/").filter(Boolean);
    var idx = -1;
    var i;
    for (i = 0; i < parts.length; i += 1) {
      if (parts[i] === "subjects") idx = i;
    }
    if (idx !== -1 && parts[idx + 1]) {
      try {
        return decodeURIComponent(parts[idx + 1]).replace(/\.html$/i, "").toLowerCase();
      } catch (error) {
        return String(parts[idx + 1]).toLowerCase();
      }
    }
    var param = new URLSearchParams(location.search).get("slug");
    if (!param) return "";
    try {
      return decodeURIComponent(param).trim().toLowerCase();
    } catch (error2) {
      return param.trim().toLowerCase();
    }
  }

  function crumb(current) {
    return '<nav class="crumb" aria-label="Breadcrumb"><ol><li><a href="/">Study path</a></li><li aria-current="page">' +
      esc(current) + "</li></ol></nav>";
  }

  function anyNew(items) {
    var i;
    for (i = 0; i < items.length; i += 1) {
      if (isNew(items[i][5])) return true;
    }
    return false;
  }

  function legendHtml(showNew) {
    return '<div class="legend" role="group" aria-label="Course labels">' +
      '<span class="badge b-beg">Beginner</span>' +
      '<span class="badge b-int">Intermediate</span>' +
      '<span class="badge b-adv">Advanced</span>' +
      (showNew ? '<span class="badge b-new">New</span>' : "") +
      '<span class="badge b-nl">Awaiting a link</span></div>';
  }

  function revealNewLegend(show) {
    var badge = document.getElementById("legend-new");
    var note = document.getElementById("new-note");
    if (badge) badge.hidden = !show;
    if (note) note.hidden = !show;
  }

  function subjectCard(track, index) {
    var items = itemsOf(track);
    var counts = tally(items);
    var first = firstItem(track);
    var categories = (track.groups || []).length;
    var waitLine = counts.waiting
      ? "<p class=\"subject-wait\">" + countSentence(counts.waiting, "course awaiting a link", "courses awaiting a link") + "</p>"
      : "";
    var start = first ? esc(first[0]) : "The first category on the page";
    return '<li><a class="subject-card" href="/subjects/' + slugs[index] + '">' +
      '<span class="ordinal" aria-hidden="true">' + pad(index + 1) + "</span>" +
      "<h3 class=\"subject-name\">" + esc(track.cat) + "</h3>" +
      "<p class=\"subject-count\"><b>" + counts.total + "</b> " +
      (counts.total === 1 ? "course" : "courses") + " · " +
      categories + " " + (categories === 1 ? "category" : "categories") + "</p>" +
      waitLine +
      "<p class=\"start-here\"><span class=\"start-label\">Start here</span>" + start + "</p>" +
      "<p class=\"hint-note\">" + esc(track.note || "") + "</p></a></li>";
  }

  function subjectCards(host) {
    if (!host) return;
    host.innerHTML = data.map(subjectCard).join("");
  }

  var titleIndex = {};
  data.forEach(function (track, index) {
    (track.groups || []).forEach(function (group) {
      (group.items || []).forEach(function (item) {
        if (!item || !item[0]) return;
        var prev = titleIndex[item[0]];
        if (!prev || (!safeUrl(prev.item[4]) && safeUrl(item[4]))) {
          titleIndex[item[0]] = { item: item, slug: slugs[index] };
        }
      });
    });
  });

  function coursesLine(titles) {
    if (!titles.length) return "No courses added.";
    return titles.map(function (title) {
      var found = titleIndex[title];
      var url = found ? safeUrl(found.item[4]) : "";
      if (!url) return esc(title);
      return '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(title) +
        '<span class="visually-hidden"> (opens in new tab)</span></a>';
    }).join(" · ");
  }

  function sortedUpdates() {
    var updates = Array.isArray(source.updates) ? source.updates.slice() : [];
    updates.sort(function (a, b) {
      return String(b && b.date).localeCompare(String(a && a.date));
    });
    return updates;
  }

  function updateItem(entry) {
    var titles = Array.isArray(entry.courses) ? entry.courses.filter(Boolean) : [];
    return '<li class="update"><time datetime="' + esc(entry.date) + '">' +
      esc(formatDate(entry.date) || entry.date || "") + "</time>" +
      '<p class="update-subject">' + esc(entry.subject || "") + "</p>" +
      '<p class="update-courses">' + coursesLine(titles) + "</p></li>";
  }

  function metaBits(item) {
    var bits = "";
    if (item[1]) bits += "<span class=\"len\">" + esc(item[1]) + "</span>";
    if (isNew(item[5])) bits += '<span class="badge b-new">New</span>';
    if (item[2] !== "n" && levels[item[2]] && levels[item[2]][0]) {
      bits += '<span class="badge ' + levels[item[2]][1] + '">' + esc(levels[item[2]][0]) + "</span>";
    }
    if (!safeUrl(item[4])) bits += '<span class="badge b-nl">Awaiting a link</span>';
    return bits;
  }

  function rowHtml(item, where, display) {
    var url = safeUrl(item[4]);
    var description = publicDescription(item[3]);
    var titleHtml = display && display.titleHtml != null ? display.titleHtml : esc(item[0]);
    var descHtml = display && display.descHtml != null ? display.descHtml : (description ? esc(description) : "");
    var title = url
      ? '<a class="row-title" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + titleHtml +
        '<span class="ext" aria-hidden="true"> ↗</span><span class="visually-hidden"> (opens in new tab)</span></a>'
      : '<p class="row-title">' + titleHtml + "</p>";
    var place = "";
    if (where && where.href) {
      place = '<a class="row-where" href="' + esc(where.href) + '">' + esc(where.label) + "</a>";
    }
    return '<li class="row' + (url ? "" : " is-awaiting") + (display && display.extra ? '" data-extra="' + esc(display.extra) : "") +
      '"' + (display && display.hidden ? ' hidden="until-found"' : "") + '><div class="row-main">' + title +
      (descHtml ? '<p class="desc">' + descHtml + "</p>" : "") +
      '</div><p class="row-meta">' + place + metaBits(item) + "</p></li>";
  }

  function fillDates() {
    var formatted = formatDate(source.lastUpdated);
    if (!formatted) return;
    var last = document.getElementById("last-updated");
    if (last) {
      last.innerHTML = 'Last updated: <time datetime="' + esc(source.lastUpdated) + '">' + esc(formatted) + "</time>";
    }
    var footer = document.getElementById("footer-updated");
    if (footer) {
      footer.innerHTML = 'Updated <time datetime="' + esc(source.lastUpdated) + '">' + esc(formatted) + "</time>.";
    }
  }

  function renderHome() {
    var resources = [];
    data.forEach(function (track) {
      resources = resources.concat(itemsOf(track));
    });
    var strip = document.getElementById("subjects");
    if (strip) {
      strip.innerHTML = data.map(function (track, index) {
        return '<a href="/subjects/' + slugs[index] + '"><span class="strip-name">' + esc(track.cat) +
          '</span><span class="strip-count">' + itemsOf(track).length + (itemsOf(track).length === 1 ? " course" : " courses") + "</span></a>";
      }).join("");
    }
    var courseSearch = document.getElementById("course-search");
    if (courseSearch) courseSearch.textContent = "or search " + resources.length + " courses";
    var preview = document.getElementById("update-preview");
    if (preview) {
      var updates = sortedUpdates();
      preview.innerHTML = updates.length
        ? updates.slice(0, PREVIEW).map(updateItem).join("")
        : '<li class="update"><p class="update-subject">No emails logged yet.</p></li>';
    }
  }

  function renderPicks() {
    if (!picks.length) return "";
    var note = picks.length === 5
      ? "Start with these five, in this order: the overview, the command line, APIs, databases, then Docker. The categories below are the full list, and they begin in a different place."
      : "A short route for a back-end beginner. The categories below are the full list.";
    return '<section id="starter-picks" aria-labelledby="starter-heading"><div class="section-head">' +
      '<h2 id="starter-heading">Start here</h2>' +
      '<p class="note">' + esc(note) + "</p></div>" +
      '<div class="picks">' + picks.map(function (pick, index) {
        var url = safeUrl(pick[2]);
        var body = '<span class="ordinal" aria-hidden="true">' + pad(index + 1) + "</span><b>" + esc(pick[0]) +
          (url ? '<span class="ext" aria-hidden="true"> ↗</span><span class="visually-hidden"> (opens in new tab)</span>' : "") +
          "</b><small>" + esc(pick[1] || "") + "</small>";
        if (!url) return '<div class="pick">' + body + "</div>";
        return '<a class="pick" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + body + "</a>";
      }).join("") + "</div></section>";
  }

  function renderSubject() {
    var root = document.getElementById("subject-root");
    if (!root) return;
    var slug = currentSlug();
    if (!slug) {
      setPageMeta(
        "Subjects · Quincy's Course Picks",
        "Every subject in the study path. Open one to read its categories and courses.",
        "/subjects"
      );
      root.innerHTML = '<header class="page-head">' + crumb("Subjects") +
        "<h1>Subjects</h1><p class=\"sub\">Pick a subject. Each page lists that path’s categories and courses.</p></header>" +
        '<ul class="subject-grid" id="subject-grid"></ul>';
      subjectCards(document.getElementById("subject-grid"));
      return;
    }
    var found = findTrack(slug);
    if (!found) {
      setPageMeta(
        "Page not found · Study path",
        "That address is not part of the study guide.",
        "/"
      );
      setRobots("noindex");
      root.innerHTML = '<header class="page-head">' + crumb("Not found") +
        "<h1>This page is not on the path.</h1>" +
        "<p class=\"sub\">That subject is not in the catalogue. Pick one that is.</p>" +
        '<p class="actions"><a class="pill" href="/">Back to the guide</a></p></header>' +
        '<ul class="subject-grid" id="subject-grid"></ul>';
      subjectCards(document.getElementById("subject-grid"));
      return;
    }

    var track = found.track;
    var counts = tally(itemsOf(track));
    var description = track.cat + " on the study path. " + (track.note || "") + " " +
      countSentence(counts.linked, "course you can open", "courses you can open") +
      (counts.waiting ? ", " + countSentence(counts.waiting, "course awaiting a link", "courses awaiting a link") : "") + ".";
    setPageMeta(track.cat + " · Quincy's Course Picks", description.replace(/\s+/g, " ").trim(), "/subjects/" + found.slug);

    var groups = track.groups || [];
    var ids = uniqueIds(groups.map(function (group) { return group.name; }));
    var hash = "";
    try {
      hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    } catch (error) {
      hash = "";
    }
    var hashed = hash && ids.indexOf(hash) !== -1;
    var showPicks = found.index === picksIndex() && picks.length;
    var showFresh = anyNew(itemsOf(track));
    var indexLinks = "";
    if (showPicks) {
      indexLinks += '<li><a href="#starter-picks">Start here <span class="idx-n">' + picks.length + "</span></a></li>";
    }
    var groupHtml = groups.map(function (group, index) {
      var id = ids[index];
      var items = (group.items || []).filter(function (item) { return item && item[0]; });
      var open = hashed ? id === hash : (!showPicks && index === 0);
      indexLinks += '<li><a href="#' + id + '">' + esc(group.name) +
        ' <span class="idx-n">' + items.length + "</span></a></li>";
      var rows = items.map(function (item) { return rowHtml(item); }).join("");
      return '<section class="group' + (open ? " is-open" : "") + '" id="' + id + '">' +
        '<div class="group-head"><h2 id="label-' + id + '"><span class="group-title">' + esc(group.name) +
        '</span> <span class="group-count">' + countSentence(items.length, "course", "courses") + "</span></h2>" +
        '<button type="button" class="group-toggle" aria-expanded="' + (open ? "true" : "false") +
        '" aria-controls="panel-' + id + '" aria-labelledby="label-' + id + '">' +
        '<span class="chevron" aria-hidden="true"></span></button></div>' +
        '<div class="group-panel" id="panel-' + id + '"' + (open ? "" : panelHiddenAttr()) + '><ul class="rows">' +
        (rows || '<li class="row"><p class="row-title">No courses in this category.</p></li>') +
        "</ul></div></section>";
    }).join("");

    var tallyText = "<b>" + counts.linked + "</b> " +
      (counts.linked === 1 ? "course you can open" : "courses you can open");
    if (counts.waiting) {
      tallyText += " · <b>" + counts.waiting + "</b> " +
        (counts.waiting === 1 ? "course awaiting a link" : "courses awaiting a link");
    }

    root.innerHTML = '<header class="page-head">' + crumb(track.cat) +
      "<h1>" + esc(track.cat) + "</h1>" +
      (track.note ? '<p class="sub">' + esc(track.note) + "</p>" : "") +
      '<p class="tally">' + tallyText + "</p>" + legendHtml(showFresh) +
      (showFresh ? '<p class="new-note">New means the course was added in the last 14 days.</p>' : "") + "</header>" +
      '<div class="subject-layout"><nav class="side-index" aria-label="Categories"><p class="kicker">On this page</p><ol>' +
      indexLinks + "</ol></nav><div class=\"subject-main\" id=\"categories\">" +
      (showPicks ? renderPicks() : "") + groupHtml +
      '<p class="back-top"><a href="#top">Back to top</a></p></div></div>';

    bindGroups();
    bindSpy();
  }

  function panelHiddenAttr() {
    return untilFound ? ' hidden="until-found"' : " hidden";
  }

  function scrollInstant(top) {
    var root = document.scrollingElement || document.documentElement;
    var node = document.documentElement;
    var previous = node.style.scrollBehavior;
    node.style.scrollBehavior = "auto";
    if (typeof top === "number") root.scrollTop = top;
    node.style.scrollBehavior = previous;
  }

  function scrollByInstant(dy) {
    var root = document.scrollingElement || document.documentElement;
    scrollInstant(root.scrollTop + dy);
  }

  function focusWithoutScroll(node) {
    if (!node) return;
    if (!node.hasAttribute("tabindex") && node.tabIndex < 0) node.setAttribute("tabindex", "-1");
    node.focus({ preventScroll: true });
  }

  function setOnlyOpen(group, anchor) {
    var before = anchor ? anchor.getBoundingClientRect().top : null;
    [].forEach.call(document.querySelectorAll(".group"), function (other) {
      other.classList.toggle("is-open", !!group && other === group);
    });
    syncExpanded();
    if (!anchor || before === null) return;
    var delta = anchor.getBoundingClientRect().top - before;
    if (Math.abs(delta) > 1) scrollByInstant(delta);
  }

  function bindGroups() {
    var main = document.querySelector(".subject-main");
    if (!main) return;
    main.addEventListener("click", function (event) {
      var button = event.target.closest(".group-toggle");
      if (!button) return;
      var group = button.closest(".group");
      if (!group) return;
      var head = group.querySelector(".group-head");
      setOnlyOpen(group.classList.contains("is-open") ? null : group, head);
    });
    [].forEach.call(document.querySelectorAll(".group-panel"), function (panel) {
      panel.addEventListener("beforematch", function () {
        var group = panel.closest(".group");
        if (!group || group.classList.contains("is-open")) return;
        setOnlyOpen(group, group.querySelector(".group-head"));
      });
    });
    var index = document.querySelector(".side-index");
    if (index) {
      index.addEventListener("click", function (event) {
        var link = event.target.closest("a");
        if (!link) return;
        var href = link.getAttribute("href") || "";
        if (href.charAt(0) !== "#") return;
        var id = href.slice(1);
        var group = document.getElementById(id);
        event.preventDefault();
        if (group && group.classList.contains("group")) {
          setOnlyOpen(group);
          var head = group.querySelector(".group-head");
          if (head) scrollInstant(Math.max(0, head.getBoundingClientRect().top + window.scrollY - 16));
          focusWithoutScroll(group.querySelector(".group-toggle"));
        } else {
          var target = document.getElementById(id);
          if (target) {
            scrollInstant(Math.max(0, target.getBoundingClientRect().top + window.scrollY - 16));
            focusWithoutScroll(target);
          }
        }
        if (history.pushState) history.pushState(null, "", "#" + id);
      });
    }
    syncExpanded();
    window.addEventListener("hashchange", function () {
      var id = "";
      try {
        id = decodeURIComponent(location.hash.replace(/^#/, ""));
      } catch (error) {
        id = "";
      }
      var target = id ? document.getElementById(id) : null;
      var group = target && (target.classList.contains("group") ? target : target.closest(".group"));
      if (group && group.classList.contains("group")) {
        setOnlyOpen(group, group.querySelector(".group-head"));
        focusWithoutScroll(group.querySelector(".group-toggle"));
      }
    });
  }

  function syncExpanded() {
    [].forEach.call(document.querySelectorAll(".group"), function (group) {
      var button = group.querySelector(".group-toggle");
      var panel = group.querySelector(".group-panel");
      var open = group.classList.contains("is-open");
      if (button) button.setAttribute("aria-expanded", open ? "true" : "false");
      if (!panel) return;
      if (open) panel.removeAttribute("hidden");
      else if (untilFound) panel.setAttribute("hidden", "until-found");
      else panel.setAttribute("hidden", "");
    });
  }

  function bindSpy() {
    var links = [].slice.call(document.querySelectorAll(".side-index a"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var byId = {};
    links.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) === "#") byId[href.slice(1)] = link;
    });
    var visible = [];
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        var at = visible.indexOf(id);
        if (entry.isIntersecting && at === -1) visible.push(id);
        if (!entry.isIntersecting && at !== -1) visible.splice(at, 1);
      });
      links.forEach(function (link) { link.removeAttribute("aria-current"); });
      if (visible.length && byId[visible[0]]) byId[visible[0]].setAttribute("aria-current", "location");
    }, { root: null, rootMargin: "-12% 0px -78% 0px", threshold: 0 });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  function renderSearch() {
    var content = document.getElementById("content");
    var query = document.getElementById("q");
    var resultsBar = document.getElementById("results-bar");
    var status = document.getElementById("results-status");
    var filters = document.getElementById("filters");
    var jump = document.getElementById("jump-filters");
    var form = document.getElementById("search-form");
    if (!content || !query) return;

    /* Level field: "b" Beginner, "i" Intermediate, "a" Advanced.
       "n" and anything else are Unrated, so the four counts add up
       to every course.
       Length is parsed from the first "Nh" or "N min" in the length
       string. Hours under 2, from 2 up to but not including 10, and
       10 or more. No number means Unknown length. */
    var levelOptions = [
      { id: "beginner", code: "b", label: "Beginner" },
      { id: "intermediate", code: "i", label: "Intermediate" },
      { id: "advanced", code: "a", label: "Advanced" },
      { id: "unrated", code: "", label: "Unrated" }
    ];
    var lengthOptions = [
      { id: "under-2h", label: "Under 2h" },
      { id: "2-10h", label: "2–10h" },
      { id: "10h-plus", label: "10h+" },
      { id: "unknown", label: "Unknown length" }
    ];
    var subjectsOn = [];
    var levelsOn = [];
    var lengthsOn = [];
    var expanded = {};
    var filtersOpen = false;
    var matchMode = "all";
    var lastNote = "";
    var booted = false;
    var lastCount = 0;
    var lastAnnounced = "";
    var announceTimer = 0;
    var totalCourses = 0;
    data.forEach(function (track) { totalCourses += itemsOf(track).length; });
    query.placeholder = "Search " + totalCourses + " courses";

    function fold(value) {
      return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    function damerau(a, b) {
      if (a === b) return 0;
      var la = a.length;
      var lb = b.length;
      if (Math.abs(la - lb) > 1) return 2;
      var dp = [];
      var i, j;
      for (i = 0; i <= la; i += 1) {
        dp[i] = [i];
      }
      for (j = 0; j <= lb; j += 1) dp[0][j] = j;
      for (i = 1; i <= la; i += 1) {
        for (j = 1; j <= lb; j += 1) {
          var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
          var value = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
          if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) {
            value = Math.min(value, dp[i - 2][j - 2] + 1);
          }
          dp[i][j] = value;
        }
      }
      return dp[la][lb];
    }

    function textWords(text) {
      var raw = String(text || "");
      var out = [];
      var re = /[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*/g;
      var match;
      while ((match = re.exec(raw))) {
        out.push({
          start: match.index,
          end: match.index + match[0].length,
          fold: fold(match[0]).replace(/-/g, "")
        });
      }
      return out;
    }

    function wordHit(q, word) {
      if (!q || !word.fold) return false;
      if (word.fold === q) return true;
      if (q.length >= 2 && word.fold.indexOf(q) === 0) return true;
      if (q.length < 5) return false;
      if (word.fold.length >= 5 && Math.abs(q.length - word.fold.length) <= 1 && damerau(q, word.fold) <= 1) return true;
      if (word.fold.length > q.length && damerau(q, word.fold.slice(0, q.length)) <= 1) return true;
      return false;
    }

    function hitRanges(q, words) {
      var ranges = [];
      words.forEach(function (word) {
        if (wordHit(q, word)) ranges.push({ start: word.start, end: word.end });
      });
      return ranges;
    }

    function queryWords() {
      return fold(query.value).split(/[^a-z0-9]+/).filter(Boolean);
    }

    function levelOf(item) {
      var i;
      for (i = 0; i < levelOptions.length; i += 1) {
        if (levelOptions[i].code && levelOptions[i].code === item[2]) return levelOptions[i].id;
      }
      return "unrated";
    }

    function hoursOf(text) {
      var value = String(text || "").toLowerCase();
      var hours = value.match(/(\d+(?:\.\d+)?)\s*h\b/);
      if (hours) return Number(hours[1]);
      var minutes = value.match(/(\d+(?:\.\d+)?)\s*min\b/);
      if (minutes) return Number(minutes[1]) / 60;
      return null;
    }

    function bucketOf(text) {
      var hours = hoursOf(text);
      if (hours === null || isNaN(hours)) return "unknown";
      if (hours < 2) return "under-2h";
      if (hours < 10) return "2-10h";
      return "10h-plus";
    }

    function scoreItem(item, track, group, words) {
      var titleWords = textWords(item[0]);
      var description = publicDescription(item[3]);
      var descWords = textWords(description);
      var extra = textWords([
        levels[item[2]] ? levels[item[2]][0] : "",
        item[1] || "",
        track.cat,
        group.name
      ].join(" "));
      if (!words.length) return { matched: 0, full: true, title: true, titleRanges: [], descRanges: [], matchedWords: [] };
      var titleRanges = [];
      var descRanges = [];
      var matchedWords = [];
      var allInTitle = true;
      var i;
      for (i = 0; i < words.length; i += 1) {
        var q = words[i];
        var inTitle = hitRanges(q, titleWords);
        var inDesc = hitRanges(q, descWords);
        var inExtra = hitRanges(q, extra);
        if (!inTitle.length && !inDesc.length && !inExtra.length) continue;
        matchedWords.push(q);
        if (!inTitle.length) allInTitle = false;
        titleRanges = titleRanges.concat(inTitle);
        descRanges = descRanges.concat(inDesc);
      }
      if (!matchedWords.length) return null;
      return {
        matched: matchedWords.length,
        full: matchedWords.length === words.length,
        title: allInTitle && matchedWords.length === words.length,
        titleRanges: titleRanges,
        descRanges: descRanges,
        matchedWords: matchedWords
      };
    }

    function highlight(text, ranges) {
      var raw = String(text || "");
      if (!ranges || !ranges.length) return esc(raw);
      var sorted = ranges.slice().sort(function (a, b) { return a.start - b.start; });
      var merged = [];
      sorted.forEach(function (range) {
        var last = merged[merged.length - 1];
        if (last && range.start <= last.end) last.end = Math.max(last.end, range.end);
        else merged.push({ start: range.start, end: range.end });
      });
      var html = "";
      var cursor = 0;
      merged.forEach(function (range) {
        var start = Math.max(0, Math.min(raw.length, range.start));
        var end = Math.max(start, Math.min(raw.length, range.end));
        html += esc(raw.slice(cursor, start)) + "<mark>" + esc(raw.slice(start, end)) + "</mark>";
        cursor = end;
      });
      return html + esc(raw.slice(cursor));
    }

    function selected(list, id) { return list.indexOf(id) !== -1; }

    function toggle(list, id) {
      var at = list.indexOf(id);
      if (at === -1) list.push(id);
      else list.splice(at, 1);
    }

    function splitParam(value) {
      if (!value) return [];
      return String(value).split(",").map(function (part) { return part.trim().toLowerCase(); }).filter(Boolean);
    }

    function known(list, id) {
      var i;
      for (i = 0; i < list.length; i += 1) if (list[i].id === id) return true;
      return false;
    }

    function readUrl() {
      var params = new URLSearchParams(location.search);
      query.value = params.get("q") || "";
      subjectsOn = splitParam(params.get("subject")).filter(function (id) { return slugs.indexOf(id) !== -1; });
      levelsOn = splitParam(params.get("level")).filter(function (id) { return known(levelOptions, id); });
      lengthsOn = splitParam(params.get("length")).filter(function (id) { return known(lengthOptions, id); });
    }

    function writeUrl(push) {
      var params = new URLSearchParams();
      var text = query.value.trim();
      if (text) params.set("q", text);
      if (subjectsOn.length) params.set("subject", subjectsOn.join(","));
      if (levelsOn.length) params.set("level", levelsOn.join(","));
      if (lengthsOn.length) params.set("length", lengthsOn.join(","));
      var qs = params.toString();
      var next = location.pathname + (qs ? "?" + qs : "");
      if (next === location.pathname + location.search) return;
      history[push ? "pushState" : "replaceState"](null, "", next);
    }

    function passesFilters(item, slug, ignore) {
      if (ignore !== "subject" && subjectsOn.length && subjectsOn.indexOf(slug) === -1) return false;
      if (ignore !== "level" && levelsOn.length && levelsOn.indexOf(levelOf(item)) === -1) return false;
      if (ignore !== "length" && lengthsOn.length && lengthsOn.indexOf(bucketOf(item[1])) === -1) return false;
      return true;
    }

    function eachItem(fn) {
      data.forEach(function (track, index) {
        var slug = slugs[index];
        (track.groups || []).forEach(function (group, groupIndex) {
          (group.items || []).forEach(function (item) {
            if (item && item[0]) fn(item, track, group, slug, groupIndex);
          });
        });
      });
    }

    function chipCount(ignore, id, kind) {
      var words = queryWords();
      var count = 0;
      eachItem(function (item, track, group, slug) {
        if (!passesFilters(item, slug, ignore)) return;
        if (kind === "subject" && slug !== id) return;
        if (kind === "level" && levelOf(item) !== id) return;
        if (kind === "length" && bucketOf(item[1]) !== id) return;
        var hit = scoreItem(item, track, group, words);
        if (!hit) return;
        if (matchMode === "all" && words.length && !hit.full) return;
        count += 1;
      });
      return count;
    }

    function chip(kind, id, label, pressed, count) {
      var disabled = !pressed && count === 0;
      return '<button type="button" class="chip" data-filter="' + kind + '" data-value="' + esc(id) +
        '" aria-pressed="' + (pressed ? "true" : "false") + '"' +
        (disabled ? ' aria-disabled="true" title="No matches with current filters"' : "") + ">" + esc(label) +
        ' <span class="chip-n">' + count + "</span></button>";
    }

    function paintFilters() {
      if (!filters) return;
      var html = '<div class="filter-group" role="group" aria-label="Subject"><span class="filter-label">Subject</span>';
      data.forEach(function (track, index) {
        html += chip("subject", slugs[index], track.cat, selected(subjectsOn, slugs[index]), chipCount("subject", slugs[index], "subject"));
      });
      html += '</div><div class="filter-group" role="group" aria-label="Level"><span class="filter-label">Level</span>';
      levelOptions.forEach(function (option) {
        html += chip("level", option.id, option.label, selected(levelsOn, option.id), chipCount("level", option.id, "level"));
      });
      html += '</div><div class="filter-group" role="group" aria-label="Length"><span class="filter-label">Length</span>';
      lengthOptions.forEach(function (option) {
        var count = chipCount("length", option.id, "length");
        if (!count && option.id === "unknown" && !selected(lengthsOn, option.id)) return;
        html += chip("length", option.id, option.label, selected(lengthsOn, option.id), count);
      });
      html += "</div>";
      if (subjectsOn.length || levelsOn.length || lengthsOn.length) {
        html += '<button type="button" class="reset" data-action="reset">Reset</button>';
      }
      filters.innerHTML = html;
    }

    function decideMode(words) {
      if (!words.length) return "all";
      var full = false;
      var any = false;
      eachItem(function (item, track, group, slug) {
        if (!passesFilters(item, slug)) return;
        var hit = scoreItem(item, track, group, words);
        if (!hit) return;
        any = true;
        if (hit.full) full = true;
      });
      if (full) return "all";
      return any ? "any" : "none";
    }

    function render() {
      var words = queryWords();
      matchMode = decideMode(words);
      var browsing = !words.length && !subjectsOn.length && !levelsOn.length && !lengthsOn.length;
      var blocks = "";
      var count = 0;
      var wordCounts = {};
      words.forEach(function (word) { wordCounts[word] = 0; });
      var sections = [];
      data.forEach(function (track, index) {
        var slug = slugs[index];
        if (subjectsOn.length && subjectsOn.indexOf(slug) === -1) return;
        var ids = uniqueIds((track.groups || []).map(function (group) { return group.name; }));
        var groupHtml = "";
        var subjectCount = 0;
        var best = 0;
        (track.groups || []).forEach(function (group, groupIndex) {
          var found = [];
          (group.items || []).forEach(function (item, itemIndex) {
            if (!item || !item[0]) return;
            if (levelsOn.length && levelsOn.indexOf(levelOf(item)) === -1) return;
            if (lengthsOn.length && lengthsOn.indexOf(bucketOf(item[1])) === -1) return;
            var hit = scoreItem(item, track, group, words);
            if (!hit) return;
            if (matchMode === "all" && words.length && !hit.full) return;
            found.push({ item: item, hit: hit, index: itemIndex });
          });
          if (!found.length) return;
          found.sort(function (a, b) {
            if (b.hit.matched !== a.hit.matched) return b.hit.matched - a.hit.matched;
            if (a.hit.title !== b.hit.title) return a.hit.title ? -1 : 1;
            return a.index - b.index;
          });
          found.forEach(function (entry) {
            if (entry.hit.matched > best) best = entry.hit.matched;
            entry.hit.matchedWords.forEach(function (word) {
              if (wordCounts[word] != null) wordCounts[word] += 1;
            });
          });
          subjectCount += found.length;
          var key = slug + ":" + ids[groupIndex];
          var open = !!expanded[key];
          var limit = browsing ? found.length : 5;
          var rows = found.map(function (entry, rowIndex) {
            var description = publicDescription(entry.item[3]);
            return rowHtml(entry.item, { label: group.name, href: "/subjects/" + slug + "#" + ids[groupIndex] }, {
              titleHtml: highlight(entry.item[0], entry.hit.titleRanges),
              descHtml: description ? highlight(description, entry.hit.descRanges) : "",
              extra: key,
              hidden: !browsing && !open && rowIndex >= limit
            });
          }).join("");
          if (browsing) {
            groupHtml += '<button type="button" class="cat-line" data-show="' + esc(key) + '" aria-expanded="' +
              (open ? "true" : "false") + '" aria-controls="rows-' + esc(key) + '"><span>' + esc(group.name) +
              '</span><span class="group-count">' + countSentence(found.length, "course", "courses") + "</span></button>" +
              '<ul class="rows" id="rows-' + esc(key) + '" data-extra="' + esc(key) + '"' +
              (open ? "" : ' hidden="until-found"') + ">" + rows + "</ul>";
          } else {
            var more = found.length > limit
              ? '<button type="button" class="show-all" data-show="' + esc(key) + '" aria-expanded="' + (open ? "true" : "false") +
                '" aria-controls="rows-' + esc(key) + '">' + (open ? "Show " + limit : "Show all " + found.length) + "</button>"
              : "";
            groupHtml += '<section class="result-group"><h3 class="result-cat">' + esc(group.name) +
              ' <span class="group-count">' + countSentence(found.length, "course", "courses") + "</span></h3>" +
              '<ul class="rows" id="rows-' + esc(key) + '">' + rows + "</ul>" + more + "</section>";
          }
        });
        if (!groupHtml) return;
        count += subjectCount;
        sections.push({
          best: best,
          html: '<section class="result-block" aria-labelledby="result-' + slug + '"><h2 class="result-title" id="result-' + slug +
            '"><a href="/subjects/' + slug + '">' + esc(track.cat) + "</a> <span class=\"group-count\">" +
            countSentence(subjectCount, "course", "courses") + "</span></h2>" + groupHtml + "</section>"
        });
      });
      if (matchMode === "any") sections.sort(function (a, b) { return b.best - a.best; });
      blocks = sections.map(function (section) { return section.html; }).join("");
      lastCount = count;
      lastNote = "";
      if (matchMode === "any") {
        var parts = words.filter(function (word) { return wordCounts[word]; }).map(function (word) {
          return word + " (" + wordCounts[word] + ")";
        });
        lastNote = "No course matches all words. Showing courses that match any: " + parts.join(", ") + ".";
      }
      paintFilters();
      paintPills();
      var countLabel = document.getElementById("filters-count");
      if (countLabel) countLabel.textContent = "(" + (subjectsOn.length + levelsOn.length + lengthsOn.length) + ")";
      if (resultsBar) {
        var summary = lastNote || (count
          ? countSentence(count, "course", "courses") + "."
          : "No courses match" + (query.value.trim() ? " “" + query.value.trim() + "”" : "") + ".");
        resultsBar.innerHTML = "<p>" + esc(summary) + "</p>";
      }
      if (!blocks) {
        var clears = "";
        subjectsOn.forEach(function (id) {
          clears += '<button type="button" data-filter="subject" data-value="' + esc(id) + '">Remove ' + esc(labelFor("subject", id)) + "</button>";
        });
        levelsOn.forEach(function (id) {
          clears += '<button type="button" data-filter="level" data-value="' + esc(id) + '">Remove ' + esc(labelFor("level", id)) + "</button>";
        });
        lengthsOn.forEach(function (id) {
          clears += '<button type="button" data-filter="length" data-value="' + esc(id) + '">Remove ' + esc(labelFor("length", id)) + "</button>";
        });
        if (query.value.trim()) clears += '<button type="button" data-action="clear-search">Clear search</button>';
        content.innerHTML = '<div class="empty"><p>No courses match' + (query.value.trim() ? " “" + esc(query.value.trim()) + "”" : "") + ".</p>" +
          "<p>Remove a filter, or clear the search, and try again.</p>" +
          (clears ? '<div class="results-actions">' + clears + "</div>" : "") + "</div>";
      } else {
        content.innerHTML = blocks;
        [].forEach.call(content.querySelectorAll("[data-extra]"), function (row) {
          row.addEventListener("beforematch", function () {
            expanded[row.getAttribute("data-extra")] = true;
            render();
          });
        });
      }
    }

    function paintPills() {
      var host = document.getElementById("active-pills");
      if (!host) return;
      var html = "";
      subjectsOn.forEach(function (id) { html += pill("subject", id); });
      levelsOn.forEach(function (id) { html += pill("level", id); });
      lengthsOn.forEach(function (id) { html += pill("length", id); });
      host.innerHTML = html;
    }

    function pill(kind, id) {
      var label = labelFor(kind, id);
      return '<button type="button" class="mini-filter" data-filter="' + kind + '" data-value="' + esc(id) + '">' +
        esc(label) + ' <span aria-hidden="true">×</span><span class="visually-hidden">, remove filter</span></button>';
    }

    function labelFor(kind, id) {
      var list = kind === "subject" ? data.map(function (track, index) { return { id: slugs[index], label: track.cat }; })
        : (kind === "level" ? levelOptions : lengthOptions);
      var i;
      for (i = 0; i < list.length; i += 1) if (list[i].id === id) return list[i].label;
      return id;
    }

    function statusText() {
      if (lastNote) return lastNote;
      if (!lastCount) return "No courses match.";
      return countSentence(lastCount, "course.", "courses.");
    }

    function announce(immediate) {
      if (!booted || !status) return;
      window.clearTimeout(announceTimer);
      var message = statusText();
      var speak = function () {
        if (message === lastAnnounced) return;
        status.textContent = message;
        lastAnnounced = message;
      };
      if (immediate) speak();
      else announceTimer = window.setTimeout(speak, 400);
    }

    function focusKept(node) {
      if (node) node.focus({ preventScroll: true });
    }

    function applyFilter(kind, id) {
      var list = kind === "subject" ? subjectsOn : (kind === "level" ? levelsOn : lengthsOn);
      toggle(list, id);
      render();
      announce(true);
      writeUrl(true);
      var again = document.querySelector('#filters [data-filter="' + kind + '"][data-value="' + id + '"]');
      if (again) focusKept(again);
    }

    function focusAfterPill(index) {
      var next = document.querySelectorAll("#active-pills .mini-filter");
      if (next.length) {
        focusKept(next[Math.min(index, next.length - 1)]);
        return;
      }
      if (filtersAreNarrow() && filtersBtn) focusKept(filtersBtn);
      else focusKept(document.querySelector("#filters .chip"));
    }

    if (filters) {
      filters.addEventListener("click", function (event) {
        var reset = event.target.closest("[data-action='reset']");
        if (reset) {
          subjectsOn = [];
          levelsOn = [];
          lengthsOn = [];
          render();
          announce(true);
          writeUrl(true);
          return;
        }
        var chipButton = event.target.closest("[data-filter]");
        if (!chipButton || chipButton.getAttribute("aria-disabled") === "true") return;
        applyFilter(chipButton.dataset.filter, chipButton.dataset.value);
      });
    }
    var sheet = content.closest(".sheet") || content;
    sheet.addEventListener("click", function (event) {
      var show = event.target.closest("[data-show]");
      if (show) {
        var key = show.getAttribute("data-show");
        expanded[key] = !expanded[key];
        render();
        announce(false);
        var again = document.querySelector('[data-show="' + key + '"]');
        if (again) again.focus();
        return;
      }
      var clear = event.target.closest("[data-action='clear-search']");
      if (clear) {
        query.value = "";
        render();
        announce(true);
        writeUrl(true);
        query.focus();
        return;
      }
      var remove = event.target.closest(".empty [data-filter], .active-pills [data-filter]");
      if (remove) {
        var fromPill = remove.classList.contains("mini-filter");
        var pills = document.querySelectorAll("#active-pills .mini-filter");
        var index = 0;
        var i;
        for (i = 0; i < pills.length; i += 1) if (pills[i] === remove) index = i;
        applyFilter(remove.dataset.filter, remove.dataset.value);
        if (fromPill) focusAfterPill(index);
      }
    });
    query.addEventListener("input", function () {
      render();
      announce(false);
      writeUrl(false);
    });
    query.addEventListener("search", function () {
      render();
      announce(true);
      writeUrl(true);
    });
    query.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && query.value) {
        event.preventDefault();
        query.value = "";
        render();
        announce(true);
        writeUrl(true);
      }
    });
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render();
        announce(true);
        writeUrl(true);
      });
    }
    window.addEventListener("popstate", function () {
      readUrl();
      render();
      announce(true);
    });
    if (jump && filters && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        var entry = entries[0];
        var away = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        jump.hidden = !away;
      }, { root: null, threshold: 0 });
      observer.observe(filters);
    }
    var dialog = document.getElementById("filters-dialog");
    var filtersBtn = document.getElementById("filters-toggle");
    function filtersAreNarrow() {
      return window.matchMedia("(max-width: 640px)").matches;
    }
    function lockDocumentScroll(locked) {
      document.documentElement.style.overflow = locked ? "hidden" : "";
    }
    function syncDialog() {
      if (!dialog || !filtersBtn) return;
      if (!filtersAreNarrow()) {
        filtersOpen = false;
        dialog.hidden = false;
        dialog.removeAttribute("role");
        dialog.removeAttribute("aria-modal");
        filtersBtn.setAttribute("aria-expanded", "false");
        lockDocumentScroll(false);
        return;
      }
      dialog.hidden = !filtersOpen;
      filtersBtn.setAttribute("aria-expanded", filtersOpen ? "true" : "false");
      if (filtersOpen) {
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        dialog.setAttribute("aria-labelledby", "filters-dialog-title");
        lockDocumentScroll(true);
      } else {
        dialog.removeAttribute("role");
        dialog.removeAttribute("aria-modal");
        lockDocumentScroll(false);
      }
    }
    function openFilters() {
      filtersOpen = true;
      syncDialog();
      var target = dialog.querySelector(".filters-close") || dialog.querySelector("button");
      if (target) target.focus({ preventScroll: true });
    }
    function closeFilters() {
      if (!filtersOpen) return;
      filtersOpen = false;
      syncDialog();
      filtersBtn.focus({ preventScroll: true });
    }
    if (filtersBtn) {
      filtersBtn.addEventListener("click", function () {
        if (filtersOpen) closeFilters();
        else openFilters();
      });
    }
    if (dialog) {
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog || event.target.closest("[data-action='close-filters']")) closeFilters();
      });
      dialog.addEventListener("keydown", function (event) {
        if (!filtersOpen) return;
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          closeFilters();
          return;
        }
        if (event.key !== "Tab") return;
        var items = dialog.querySelectorAll("button:not([disabled])");
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
    }
    window.addEventListener("resize", syncDialog);
    var allItems = [];
    data.forEach(function (track) { allItems = allItems.concat(itemsOf(track)); });
    revealNewLegend(anyNew(allItems));
    readUrl();
    render();
    syncDialog();
    booted = true;
    if (window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(pointer: coarse)").matches) {
      query.focus({ preventScroll: true });
    }
  }

  function renderUpdates() {
    var list = document.getElementById("update-list");
    var count = document.getElementById("update-count");
    var updates = sortedUpdates();
    if (count) {
      count.textContent = updates.length
        ? countSentence(updates.length, "email", "emails") + ", newest first."
        : "No emails logged yet.";
    }
    if (list) {
      list.innerHTML = updates.length
        ? updates.map(updateItem).join("")
        : '<li class="update"><p class="update-subject">No emails logged yet.</p></li>';
    }
  }

  function bindSkip() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[href='#main']");
      if (!link) return;
      var target = document.getElementById("main");
      if (target) target.focus({ preventScroll: true });
    });
  }

  fillDates();
  if (page === "home") renderHome();
  else if (page === "subject") renderSubject();
  else if (page === "search") renderSearch();
  else if (page === "updates") renderUpdates();
  bindSkip();
})();
