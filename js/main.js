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

  function legendHtml() {
    return '<div class="legend" role="group" aria-label="Course labels">' +
      '<span class="badge b-beg">Beginner</span>' +
      '<span class="badge b-int">Intermediate</span>' +
      '<span class="badge b-adv">Advanced</span>' +
      '<span class="badge b-new">New</span>' +
      '<span class="badge b-nl">Awaiting a link</span></div>';
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

  function rowHtml(item, where) {
    var url = safeUrl(item[4]);
    var description = publicDescription(item[3]);
    var title = url
      ? '<a class="row-title" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(item[0]) +
        '<span class="ext" aria-hidden="true"> ↗</span><span class="visually-hidden"> (opens in new tab)</span></a>'
      : '<p class="row-title">' + esc(item[0]) + "</p>";
    var place = "";
    if (where && where.href) {
      place = '<a class="row-where" href="' + esc(where.href) + '">' + esc(where.label) + "</a>";
    }
    return '<li class="row' + (url ? "" : " is-awaiting") + '"><div class="row-main">' + title +
      (description ? '<p class="desc">' + esc(description) + "</p>" : "") +
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
    var counts = tally(resources);
    var linkedNode = document.getElementById("stat-linked");
    var mentionNode = document.getElementById("stat-mentions");
    var subjectNode = document.getElementById("stat-subjects");
    var picksNode = document.getElementById("stat-picks");
    if (linkedNode) linkedNode.textContent = String(counts.linked);
    if (mentionNode) mentionNode.textContent = String(counts.waiting);
    if (subjectNode) subjectNode.textContent = String(data.length);
    if (picksNode) picksNode.textContent = String(picks.length);
    var picksLink = document.getElementById("picks-link");
    if (picksLink && data.length) {
      picksLink.href = "/subjects/" + slugs[picksIndex()] + "#starter-picks";
    }
    subjectCards(document.getElementById("subject-grid"));
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
    var heading = picks.length === 5 ? "Top 5 for a back-end beginner" : "Starter picks";
    return '<section id="starter-picks" aria-labelledby="starter-heading"><div class="section-head">' +
      '<h2 id="starter-heading">' + esc(heading) + "</h2>" +
      '<p class="note">A starter route for back-end, separate from the catalogue. The order is the overview, the command line, APIs, databases, then Docker. The Back-end subject is the wider list: Foundations starts with the command line and comes before that overview. These are two ways through the same courses, not one syllabus of prerequisites.</p></div>' +
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
        '<p class="actions"><a class="pill" href="/">Back to the guide <span aria-hidden="true">↗</span></a></p></header>' +
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
    var indexLinks = "";
    if (showPicks) {
      indexLinks += '<li><a href="#starter-picks">Starter picks <span class="idx-n">' + picks.length + "</span></a></li>";
    }
    var groupHtml = groups.map(function (group, index) {
      var id = ids[index];
      var items = (group.items || []).filter(function (item) { return item && item[0]; });
      var open = hashed ? id === hash : index === 0;
      indexLinks += '<li><a href="#' + id + '">' + esc(group.name) +
        ' <span class="idx-n">' + items.length + "</span></a></li>";
      var rows = items.map(function (item) { return rowHtml(item); }).join("");
      return '<section class="group' + (open ? " is-open" : "") + '" id="' + id + '">' +
        '<div class="group-head"><h2 id="label-' + id + '"><span class="group-title">' + esc(group.name) +
        '</span> <span class="group-count">' + countSentence(items.length, "course", "courses") + "</span></h2>" +
        '<button type="button" class="group-toggle" aria-expanded="' + (open ? "true" : "false") +
        '" aria-controls="panel-' + id + '" aria-labelledby="label-' + id + '">' +
        '<span class="chevron" aria-hidden="true"></span></button></div>' +
        '<div class="group-panel" id="panel-' + id + '"><ul class="rows">' +
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
      '<p class="tally">' + tallyText + "</p>" + legendHtml() +
      '<p class="new-note">New means the course was added in the last 14 days.</p></header>' +
      '<div class="subject-layout"><nav class="side-index" aria-label="Categories"><p class="kicker">On this page</p><ol>' +
      indexLinks + "</ol></nav><div class=\"subject-main\" id=\"categories\">" +
      (showPicks ? renderPicks() : "") + groupHtml +
      '<p class="back-top"><a href="#top">Back to top</a></p></div></div>';

    bindGroups();
    bindSpy();
  }

  function bindGroups() {
    var main = document.querySelector(".subject-main");
    if (!main) return;
    main.addEventListener("click", function (event) {
      var button = event.target.closest(".group-toggle");
      if (!button) return;
      if (!window.matchMedia("(max-width: 800px)").matches) return;
      var group = button.closest(".group");
      if (!group) return;
      group.classList.toggle("is-open");
      syncExpanded();
    });
    syncExpanded();
    var mobileMq = window.matchMedia("(max-width: 800px)");
    function onMode(event) {
      if (!event.matches) {
        syncExpanded();
        return;
      }
      var groups = [].slice.call(document.querySelectorAll(".group"));
      if (!groups.length) return;
      var current = null;
      groups.forEach(function (group) {
        var rect = group.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.45 && rect.bottom > 64) current = group;
      });
      if (!current) current = groups[0];
      groups.forEach(function (group) {
        group.classList.toggle("is-open", group === current);
      });
      syncExpanded();
    }
    if (mobileMq.addEventListener) mobileMq.addEventListener("change", onMode);
    window.addEventListener("hashchange", function () {
      var id = "";
      try {
        id = decodeURIComponent(location.hash.replace(/^#/, ""));
      } catch (error) {
        id = "";
      }
      var target = id ? document.getElementById(id) : null;
      var group = target && (target.classList.contains("group") ? target : target.closest(".group"));
      if (group) group.classList.add("is-open");
      syncExpanded();
    });
  }

  function syncExpanded() {
    var mobile = window.matchMedia("(max-width: 800px)").matches;
    [].forEach.call(document.querySelectorAll(".group"), function (group) {
      var button = group.querySelector(".group-toggle");
      if (!button) return;
      var open = !mobile || group.classList.contains("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
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
    var tabs = document.getElementById("tabs");
    var content = document.getElementById("content");
    var query = document.getElementById("q");
    var resultsBar = document.getElementById("results-bar");
    var status = document.getElementById("results-status");
    var toolbar = document.getElementById("toolbar");
    var jump = document.getElementById("jump-filters");
    if (!tabs || !content || !query) return;

    var current = "All";
    var booted = false;
    var lastLinked = 0;
    var lastMention = 0;
    var lastAnnounced = "";
    var announceTimer = 0;

    function resolveSubject(value) {
      if (!value || value === "All") return "All";
      var lowered = value.toLowerCase();
      var i;
      for (i = 0; i < data.length; i += 1) {
        if (data[i].cat === value || slugs[i] === lowered) return data[i].cat;
      }
      return "All";
    }

    function subjectSlug(name) {
      var i;
      for (i = 0; i < data.length; i += 1) {
        if (data[i].cat === name) return slugs[i];
      }
      return "";
    }

    var params = new URLSearchParams(location.search);
    current = resolveSubject(params.get("subject") || "");
    if (params.get("q")) query.value = params.get("q");

    function haystack(item, track, group) {
      return [
        item[0], item[1], item[3],
        levelWords[item[2]] || "",
        levels[item[2]] ? levels[item[2]][0] : "",
        track.cat, group.name,
        safeUrl(item[4]) ? "" : "awaiting a link"
      ].join(" ").toLowerCase();
    }

    function scopeLabel() {
      return current === "All" ? "All subjects" : current;
    }

    function summaryText(term) {
      var text = scopeLabel() + " · " +
        countSentence(lastLinked, "course you can open", "courses you can open") + " · " +
        countSentence(lastMention, "awaiting a link", "awaiting a link");
      if (term) text = "“" + term + "” · " + text;
      return text;
    }

    function statusText(term) {
      var parts = [scopeLabel() + "."];
      if (term) parts.push("Search “" + term + "”.");
      if (!lastLinked && !lastMention) parts.push("No matches.");
      else {
        parts.push(countSentence(lastLinked, "course you can open.", "courses you can open."));
        parts.push(countSentence(lastMention, "awaiting a link.", "awaiting a link."));
      }
      return parts.join(" ");
    }

    function actionButtons(term) {
      var html = "";
      if (term) html += '<button type="button" data-action="clear-search">Clear search</button>';
      if (current !== "All") html += '<button type="button" data-action="search-all">' + (term ? "Search all subjects" : "Show all subjects") + "</button>";
      return html ? '<div class="results-actions">' + html + "</div>" : "";
    }

    function render() {
      var term = query.value.trim().toLowerCase();
      var raw = query.value.trim();
      var linkedCount = 0;
      var mentionCount = 0;
      var html = data.filter(function (track) {
        return current === "All" || track.cat === current;
      }).map(function (track, index) {
        var realIndex = current === "All" ? index : data.indexOf(track);
        var slug = slugs[realIndex];
        var ids = uniqueIds((track.groups || []).map(function (group) { return group.name; }));
        var rows = "";
        (track.groups || []).forEach(function (group, groupIndex) {
          (group.items || []).forEach(function (item) {
            if (!item || !item[0]) return;
            if (term && haystack(item, track, group).indexOf(term) === -1) return;
            if (safeUrl(item[4])) linkedCount += 1;
            else mentionCount += 1;
            rows += rowHtml(item, {
              label: group.name,
              href: "/subjects/" + slug + "#" + ids[groupIndex]
            });
          });
        });
        if (!rows) return "";
        var shown = (rows.match(/<li class="row/g) || []).length;
        return '<section class="result-block" aria-labelledby="result-' + slug + '">' +
          '<h2 class="result-title" id="result-' + slug + '"><a href="/subjects/' + slug + '">' + esc(track.cat) +
          '</a> <span class="group-count">' + countSentence(shown, "course", "courses") + "</span></h2>" +
          '<ul class="rows">' + rows + "</ul></section>";
      }).join("");

      lastLinked = linkedCount;
      lastMention = mentionCount;
      if (resultsBar) {
        resultsBar.innerHTML = "<p>" + esc(summaryText(raw)) + "</p>" +
          (linkedCount + mentionCount > 0 ? actionButtons(raw) : "");
      }
      if (!html) {
        content.innerHTML = '<div class="empty"><p>No matches for “' + esc(raw) + "” in " + esc(scopeLabel()) + ".</p>" +
          "<p>Search checks the title, description, duration, level, group, and subject.</p>" +
          actionButtons(raw) + "</div>";
      } else {
        content.innerHTML = html;
      }
    }

    function announce(immediate) {
      if (!booted || !status) return;
      window.clearTimeout(announceTimer);
      var message = statusText(query.value.trim());
      var speak = function () {
        if (message === lastAnnounced) return;
        status.textContent = message;
        lastAnnounced = message;
      };
      if (immediate) speak();
      else announceTimer = window.setTimeout(speak, 400);
    }

    function writeUrl() {
      var next = new URLSearchParams();
      var term = query.value.trim();
      var slug = current === "All" ? "" : subjectSlug(current);
      if (term) next.set("q", term);
      if (slug) next.set("subject", slug);
      var qs = next.toString();
      var url = location.pathname + (qs ? "?" + qs : "") + location.hash;
      if (url !== location.pathname + location.search + location.hash) {
        history.replaceState(null, "", url);
      }
    }

    function setTrack(name) {
      current = name;
      [].forEach.call(tabs.children, function (tab) {
        var on = tab.dataset.track === name;
        tab.classList.toggle("active", on);
        tab.setAttribute("aria-pressed", on ? "true" : "false");
      });
      render();
      announce(true);
      writeUrl();
    }

    ["All"].concat(data.map(function (track) { return track.cat; })).forEach(function (name) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "tab" + (name === current ? " active" : "");
      button.textContent = name === "All" ? "All subjects" : name;
      button.dataset.track = name;
      button.setAttribute("aria-pressed", name === current ? "true" : "false");
      button.setAttribute("aria-controls", "content");
      button.addEventListener("click", function () { setTrack(name); });
      tabs.appendChild(button);
    });

    var actionRoot = content.closest(".sheet") || content;
    actionRoot.addEventListener("click", function (event) {
      var button = event.target.closest("[data-action]");
      if (!button) return;
      if (button.dataset.action === "clear-search") {
        query.value = "";
        render();
        announce(true);
        writeUrl();
        query.focus();
      } else if (button.dataset.action === "search-all") {
        setTrack("All");
        var all = tabs.querySelector('[data-track="All"]');
        if (all) all.focus();
      }
    });

    query.addEventListener("input", function () {
      render();
      announce(false);
      writeUrl();
    });
    query.addEventListener("search", function () {
      render();
      announce(true);
      writeUrl();
    });
    query.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && query.value) {
        event.preventDefault();
        query.value = "";
        render();
        announce(true);
        writeUrl();
      }
    });

    if (jump && toolbar && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        var entry = entries[0];
        var away = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        jump.hidden = !away;
      }, { root: null, threshold: 0 });
      observer.observe(toolbar);
    }

    render();
    writeUrl();
    booted = true;
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
