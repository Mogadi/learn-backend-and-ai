/* Renders the catalogue from window.StudyPath (js/courses.js).
   Both scripts use defer and run in document order.
   courses.js data shapes are read-only: items stay
   [title, length, level, description, url, added]. */
(function () {
  var source = window.StudyPath;
  var picksHost = document.getElementById("picks");
  var top5 = document.getElementById("top5");
  var tabs = document.getElementById("tabs");
  var content = document.getElementById("content");
  var query = document.getElementById("q");
  var resultsBar = document.getElementById("results-bar");
  var toolbar = document.getElementById("toolbar");
  var jump = document.getElementById("jump-filters");

  if (!source || !picksHost || !tabs || !content || !query) return;

  var picks = source.picks;
  var data = source.data;
  var levels = {
    b: ["Beginner", "b-beg"],
    i: ["Intermediate", "b-int"],
    a: ["Advanced", "b-adv"],
    n: ["", ""]
  };
  var levelWords = { b: "beginner", i: "intermediate", a: "advanced", n: "" };
  var status = document.getElementById("results-status");
  var current = "All";
  var booted = false;
  var NEW_DAYS = 14;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var lastLinked = 0;
  var lastMention = 0;
  var lastAnnounced = "";
  var announceTimer = 0;

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

  function haystack(item, track, group) {
    return [
      item[0],
      item[1],
      item[3],
      levelWords[item[2]] || "",
      levels[item[2]] ? levels[item[2]][0] : "",
      track.cat,
      group.name,
      item[4] ? "" : "mention awaiting a link"
    ].join(" ").toLowerCase();
  }

  function matches(item, track, group, term) {
    if (!term) return true;
    return haystack(item, track, group).indexOf(term) !== -1;
  }

  var formattedUpdate = formatDate(source.lastUpdated);
  var lastUpdatedNode = document.getElementById("last-updated");
  if (lastUpdatedNode && formattedUpdate) {
    lastUpdatedNode.innerHTML = 'Last updated: <time datetime="' + esc(source.lastUpdated) + '">' + esc(formattedUpdate) + "</time>";
  }
  var footerUpdated = document.getElementById("footer-updated");
  if (footerUpdated && formattedUpdate) {
    footerUpdated.innerHTML = 'Updated <time datetime="' + esc(source.lastUpdated) + '">' + esc(formattedUpdate) + "</time>.";
  }

  var updateList = document.getElementById("update-list");
  var updates = Array.isArray(source.updates) ? source.updates.slice() : [];
  updates.sort(function (a, b) {
    return String(b && b.date).localeCompare(String(a && a.date));
  });
  if (updateList) {
    updateList.innerHTML = updates.map(function (entry) {
      var titles = Array.isArray(entry.courses) ? entry.courses.filter(Boolean) : [];
      var courseText = titles.length ? titles.map(esc).join(" · ") : "No courses added.";
      return '<li class="update">' +
        '<time datetime="' + esc(entry.date) + '">' + esc(formatDate(entry.date) || entry.date) + "</time>" +
        '<p class="update-subject">' + esc(entry.subject) + "</p>" +
        '<p class="update-courses">' + courseText + "</p></li>";
    }).join("");
  }

  picksHost.innerHTML = picks.map(function (pick, index) {
    return '<a class="pick" href="' + esc(pick[2]) + '" target="_blank" rel="noopener noreferrer">' +
      '<span class="num">' + (index + 1) + "</span>" +
      "<b>" + esc(pick[0]) +
      '<span class="ext" aria-hidden="true"> ↗</span>' +
      '<span class="visually-hidden"> (opens in new tab)</span></b>' +
      "<small>" + esc(pick[1]) + "</small></a>";
  }).join("");

  function metaHtml(item, extra) {
    var fresh = isNew(item[5]) ? '<span class="badge b-new">New</span>' : "";
    var badge = item[2] !== "n" && levels[item[2]] && levels[item[2]][0]
      ? '<span class="badge ' + levels[item[2]][1] + '">' + levels[item[2]][0] + "</span>"
      : "";
    return '<p class="t"><span>' + esc(item[1]) + "</span>" + fresh + badge + (extra || "") + "</p>";
  }

  function descHtml(item) {
    var description = publicDescription(item[3]);
    return description ? '<p class="desc">' + esc(description) + "</p>" : "";
  }

  function cardHtml(item) {
    return '<a class="card" href="' + esc(item[4]) + '" target="_blank" rel="noopener noreferrer">' +
      '<span class="card-title">' + esc(item[0]) +
      '<span class="ext" aria-hidden="true"> ↗</span>' +
      '<span class="visually-hidden"> (opens in new tab)</span></span>' +
      metaHtml(item) +
      descHtml(item) +
      "</a>";
  }

  function mentionHtml(item) {
    return '<li class="mention">' +
      '<p class="mention-title">' + esc(item[0]) + "</p>" +
      metaHtml(item, '<span class="badge b-nl">Awaiting a link</span>') +
      descHtml(item) +
      "</li>";
  }

  function scopeLabel() {
    return current === "All" ? "All tracks" : current;
  }

  function countSentence(count, singular, plural) {
    return count + " " + (count === 1 ? singular : plural);
  }

  function summaryText(term) {
    var text = scopeLabel() + " · " +
      countSentence(lastLinked, "course you can open", "courses you can open") + " · " +
      countSentence(lastMention, "newsletter mention", "newsletter mentions");
    if (term) text = "“" + term + "” · " + text;
    return text;
  }

  function statusText(term) {
    var parts = [scopeLabel() + "."];
    if (term) parts.push("Search “" + term + "”.");
    if (lastLinked === 0 && lastMention === 0) parts.push("No matches.");
    else {
      parts.push(countSentence(lastLinked, "course you can open.", "courses you can open."));
      parts.push(countSentence(lastMention, "newsletter mention.", "newsletter mentions."));
    }
    return parts.join(" ");
  }

  function actionButtons(term) {
    var html = "";
    if (term) html += '<button type="button" data-action="clear-search">Clear search</button>';
    if (current !== "All") html += '<button type="button" data-action="search-all">' + (term ? "Search all tracks" : "Show all tracks") + "</button>";
    return html ? '<div class="results-actions">' + html + "</div>" : "";
  }

  function render() {
    var term = query.value.trim().toLowerCase();
    var rawTerm = query.value.trim();
    var linkedCount = 0;
    var mentionCount = 0;
    var tracksHtml = data.filter(function (track) {
      return current === "All" || track.cat === current;
    }).map(function (track) {
      var groupsHtml = "";
      var mentionGroups = "";
      track.groups.forEach(function (group) {
        var linked = [];
        var mentions = [];
        group.items.forEach(function (item) {
          if (!matches(item, track, group, term)) return;
          if (item[4]) linked.push(item);
          else mentions.push(item);
        });
        if (linked.length) {
          linkedCount += linked.length;
          groupsHtml += '<div class="group"><h3>' + esc(group.name) + '</h3><div class="grid">' +
            linked.map(cardHtml).join("") + "</div></div>";
        }
        if (mentions.length) {
          mentionCount += mentions.length;
          mentionGroups += '<p class="mention-group">' + esc(group.name) + '</p><ul class="mention-list">' +
            mentions.map(mentionHtml).join("") + "</ul>";
        }
      });
      if (!groupsHtml && !mentionGroups) return "";
      var mentionsBlock = mentionGroups
          ? '<div class="mentions"><h3>Newsletter mentions</h3>' +
          '<p class="note">Named in a newsletter. A checked link is not on file, so these are not links.</p>' +
          mentionGroups + "</div>"
        : "";
      var id = "track-" + track.cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return '<section class="track" aria-labelledby="' + id + '">' +
        '<div class="section-head"><h2 id="' + id + '">' + esc(track.cat) + "</h2>" +
        '<p class="note">' + esc(track.note) + "</p></div>" +
        groupsHtml + mentionsBlock + "</section>";
    }).join("");

    lastLinked = linkedCount;
    lastMention = mentionCount;

    var showPicks = !term && (current === "All" || current === "Back-end");
    if (top5) top5.hidden = !showPicks;

    if (resultsBar) {
      var showSummaryActions = linkedCount + mentionCount > 0;
      resultsBar.innerHTML = '<p>' + esc(summaryText(rawTerm)) + "</p>" +
        (showSummaryActions ? actionButtons(rawTerm) : "");
    }

    if (!tracksHtml) {
      content.innerHTML = '<div class="empty"><p>No matches for “' + esc(rawTerm) + "” in " + esc(scopeLabel()) + ".</p>" +
        "<p>Search checks the title, description, duration, level, group, and the track you selected.</p>" +
        actionButtons(rawTerm) + "</div>";
    } else if (!linkedCount && mentionCount) {
      content.innerHTML = '<p class="note match-note">No courses to open match this search. Newsletter mentions that match are listed with their track.</p>' + tracksHtml;
    } else {
      content.innerHTML = tracksHtml;
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

  function setTrack(name) {
    current = name;
    Array.prototype.forEach.call(tabs.children, function (tab) {
      var on = tab.dataset.track === name;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-pressed", on ? "true" : "false");
    });
    render();
    announce(true);
  }

  ["All"].concat(data.map(function (track) { return track.cat; })).forEach(function (name) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "tab" + (name === "All" ? " active" : "");
    button.textContent = name;
    button.dataset.track = name;
    button.setAttribute("aria-pressed", name === "All" ? "true" : "false");
    button.setAttribute("aria-controls", "content");
    button.addEventListener("click", function () {
      setTrack(name);
    });
    tabs.appendChild(button);
  });

  var resources = data.reduce(function (list, track) {
    return list.concat(track.groups.reduce(function (items, group) {
      return items.concat(group.items);
    }, []));
  }, []);
  var linkedTotal = resources.filter(function (item) { return item[4]; }).length;
  document.getElementById("stat-linked").textContent = String(linkedTotal);
  document.getElementById("stat-mentions").textContent = String(resources.length - linkedTotal);
  document.getElementById("stat-tracks").textContent = String(data.length);
  document.getElementById("stat-picks").textContent = String(picks.length);

  Array.prototype.forEach.call(document.querySelectorAll('a[href="#main"]'), function (link) {
    link.addEventListener("click", function () {
      var target = document.getElementById("main");
      if (target) target.focus({ preventScroll: true });
    });
  });

  document.getElementById("main").addEventListener("click", function (event) {
    var button = event.target.closest("[data-action]");
    if (!button) return;
    if (button.dataset.action === "clear-search") {
      query.value = "";
      render();
      announce(true);
      query.focus();
    } else if (button.dataset.action === "search-all") {
      setTrack("All");
      var allTracks = tabs.querySelector('[data-track="All"]');
      if (allTracks) allTracks.focus();
    }
  });

  query.addEventListener("input", function () {
    render();
    announce(false);
  });
  query.addEventListener("search", function () {
    render();
    announce(true);
  });
  query.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && query.value) {
      event.preventDefault();
      query.value = "";
      render();
      announce(true);
    }
  });

  if (jump && toolbar && "IntersectionObserver" in window) {
    var page = document.querySelector(".page");
    var syncing = false;
    function scrollRoot() {
      return document.body.classList.contains("has-jump") ? page : document.scrollingElement;
    }
    function setJump(show) {
      if (!page || show === !jump.hidden) return;
      syncing = true;
      if (show) {
        var y = window.scrollY || 0;
        jump.hidden = false;
        document.body.classList.add("has-jump");
        window.scrollTo(0, 0);
        page.scrollTop = y;
      } else {
        var y2 = page.scrollTop;
        document.body.classList.remove("has-jump");
        jump.hidden = true;
        window.scrollTo(0, y2);
      }
      window.requestAnimationFrame(function () { syncing = false; });
    }
    var observer = new IntersectionObserver(function (entries) {
      if (syncing) return;
      var entry = entries[0];
      var away = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      setJump(away);
    }, { threshold: 0 });
    observer.observe(toolbar);
    jump.addEventListener("click", function (event) {
      event.preventDefault();
      var root = scrollRoot();
      var top = toolbar.getBoundingClientRect().top - (root === page ? page.getBoundingClientRect().top : 0) + (root.scrollTop || window.scrollY || 0);
      if (root === page) page.scrollTop = Math.max(0, top - 12);
      else window.scrollTo(0, Math.max(0, top - 12));
      setJump(false);
      query.focus();
    });
  }

  render();
  booted = true;
})();
