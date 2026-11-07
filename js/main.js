/* Renders the catalogue from window.StudyPath (js/courses.js).
   Both scripts use defer and run in document order. */
(function () {
  var source = window.StudyPath;
  var picksHost = document.getElementById("picks");
  var tabs = document.getElementById("tabs");
  var content = document.getElementById("content");
  var query = document.getElementById("q");

  if (!source || !picksHost || !tabs || !content || !query) return;

  var picks = source.picks;
  var data = source.data;
  var levels = {
    b: ["Beginner", "b-beg"],
    i: ["Intermediate", "b-int"],
    a: ["Advanced", "b-adv"],
    n: ["", ""]
  };
  var status = document.getElementById("results-status");
  var current = "All";
  var booted = false;
  var NEW_DAYS = 14;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
      "<b>" + esc(pick[0]) + '<span class="visually-hidden"> (opens in new tab)</span></b>' +
      "<small>" + esc(pick[1]) + "</small></a>";
  }).join("");

  function render() {
    var term = query.value.trim().toLowerCase();
    var shown = 0;
    var html = data.filter(function (track) {
      return current === "All" || track.cat === current;
    }).map(function (track) {
      var groups = track.groups.map(function (group) {
        var items = group.items.filter(function (item) {
          return !term || (item[0] + " " + item[3]).toLowerCase().includes(term);
        });
        if (!items.length) return "";
        shown += items.length;
        var cards = items.map(function (item) {
          var title = item[4]
            ? '<a href="' + esc(item[4]) + '" target="_blank" rel="noopener noreferrer">' + esc(item[0]) +
              '<span class="ext" aria-hidden="true"> ↗</span><span class="visually-hidden"> (opens in new tab)</span></a>'
            : '<span class="title-nolink">' + esc(item[0]) + "</span>";
          var badge = item[2] !== "n"
            ? '<span class="badge ' + levels[item[2]][1] + '">' + levels[item[2]][0] + "</span>"
            : "";
          var fresh = isNew(item[5]) ? '<span class="badge b-new">New</span>' : "";
          var missing = item[4] ? "" : '<span class="badge b-nl">no link</span>';
          var description = item[3] && item[3].charAt(0) !== "("
            ? '<div class="desc">' + esc(item[3]) + "</div>"
            : "";
          return '<article class="card">' + title +
            '<div class="t"><span>' + esc(item[1]) + "</span>" + fresh + badge + missing + "</div>" +
            description + "</article>";
        }).join("");
        return '<div class="group"><h3>' + esc(group.name) + '</h3><div class="grid">' + cards + "</div></div>";
      }).join("");
      if (!groups) return "";
      return '<section class="section-head" aria-label="' + esc(track.cat) + '">' +
        '<h2><span class="cat-icon" aria-hidden="true">' + esc(track.icon) + "</span> " + esc(track.cat) + "</h2>" +
        '<p class="note">' + esc(track.note) + "</p></section>" + groups;
    }).join("");

    content.innerHTML = html || '<p class="note empty">No matches.</p>';

    if (booted && status) {
      if (shown === 0) status.textContent = "No matches.";
      else if (shown === 1) status.textContent = "1 course shown.";
      else status.textContent = shown + " courses shown.";
    }
  }

  ["All"].concat(data.map(function (track) { return track.cat; })).forEach(function (name) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "tab" + (name === "All" ? " active" : "");
    button.textContent = name;
    button.setAttribute("aria-pressed", name === "All" ? "true" : "false");
    button.setAttribute("aria-controls", "content");
    button.addEventListener("click", function () {
      current = name;
      Array.prototype.forEach.call(tabs.children, function (tab) {
        var on = tab === button;
        tab.classList.toggle("active", on);
        tab.setAttribute("aria-pressed", on ? "true" : "false");
      });
      render();
    });
    tabs.appendChild(button);
  });

  var resources = data.reduce(function (list, track) {
    return list.concat(track.groups.reduce(function (items, group) {
      return items.concat(group.items);
    }, []));
  }, []);
  document.getElementById("stat-resources").textContent = String(resources.length);
  document.getElementById("stat-tracks").textContent = String(data.length);
  document.getElementById("stat-picks").textContent = String(picks.length);
  document.getElementById("stat-linked").textContent = String(resources.filter(function (item) {
    return item[4];
  }).length);

  Array.prototype.forEach.call(document.querySelectorAll('a[href="#main"]'), function (link) {
    link.addEventListener("click", function () {
      var target = document.getElementById("main");
      if (target) target.focus({ preventScroll: true });
    });
  });

  query.addEventListener("input", render);
  render();
  booted = true;
})();
