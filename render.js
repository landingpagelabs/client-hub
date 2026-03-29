/* ============================================================
   Landing Page Labs — Client Hub Render Engine
   ============================================================ */

(async function () {
  var loadingEl = document.getElementById('loading');
  var errorEl = document.getElementById('error');
  var contentEl = document.getElementById('hubContent');

  /* ---------- Extract slug from URL ---------- */
  var path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  var slug = path.split('/').pop();

  if (!slug) {
    showError();
    return;
  }

  /* ---------- Fetch client data ---------- */
  var data;
  try {
    var res = await fetch('/clients/' + slug + '.json');
    if (!res.ok) throw new Error('Not found');
    data = await res.json();
  } catch (e) {
    showError();
    return;
  }

  /* ---------- Render ---------- */
  render(data);

  function showError() {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'flex';
  }

  /* Strip protocol, query strings, and trailing slashes for display */
  function cleanUrl(url) {
    try {
      var u = new URL(url);
      var display = u.hostname + u.pathname;
      if (display.length > 1 && display.endsWith('/')) {
        display = display.slice(0, -1);
      }
      return display;
    } catch (e) {
      return url;
    }
  }

  /* Arrow button that opens a URL in a new tab */
  function createOpenButton(url) {
    var btn = document.createElement('a');
    btn.className = 'open-btn';
    btn.href = url;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.setAttribute('title', 'Open in new tab');
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 7.66667V11.6667C11 12.0203 10.8595 12.3594 10.6095 12.6095C10.3594 12.8595 10.0203 13 9.66667 13H2.33333C1.97971 13 1.64057 12.8595 1.39052 12.6095C1.14048 12.3594 1 12.0203 1 11.6667V4.33333C1 3.97971 1.14048 3.64057 1.39052 3.39052C1.64057 3.14048 1.97971 3 2.33333 3H6.33333M9 1H13M13 1V5M13 1L5.66667 8.33333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return btn;
  }

  function createCopyButton(text) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('title', 'Copy to clipboard');
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copied';
        btn.classList.add('copy-btn--copied');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('copy-btn--copied');
        }, 2000);
      });
    });
    return btn;
  }

  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function render(d) {
    /* Page title */
    document.title = d.projectType + ' — ' + d.clientName + ' — Landing Page Labs';

    /* Client logo */
    if (d.clientLogo) {
      var logoWrap = document.getElementById('heroClientLogo');
      var logoImg = document.getElementById('heroClientLogoImg');
      logoImg.src = d.clientLogo;
      logoImg.alt = d.clientName;
      logoWrap.style.display = 'flex';
    }

    /* Hero */
    document.getElementById('heroLabel').textContent = d.projectType;
    document.getElementById('heroTitle').textContent = d.clientName;

    /* Last updated */
    if (d.lastUpdated) {
      var date = new Date(d.lastUpdated + 'T00:00:00');
      var formatted = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
      document.getElementById('heroUpdated').textContent = 'Last updated: ' + formatted;
    }

    /* Note box */
    if (d.note) {
      document.getElementById('noteText').textContent = d.note;
    } else {
      document.getElementById('noteSection').style.display = 'none';
    }

    /* Table of Contents — only show when 4+ sections */
    var tocList = document.getElementById('tocList');
    if (d.sections.length >= 4) {
      document.getElementById('tocSection').style.display = 'block';
      d.sections.forEach(function (section) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        var id = slugify(section.heading);
        a.href = '#' + id;
        a.textContent = section.heading;
        li.appendChild(a);
        tocList.appendChild(li);
      });
    }

    /* Sections */
    var container = document.getElementById('sectionsContainer');
    d.sections.forEach(function (section) {
      var card = document.createElement('div');
      card.className = 'hub-section';
      card.id = slugify(section.heading);

      /* Section heading */
      var headingRow = document.createElement('div');
      headingRow.className = 'hub-section__header';

      var h2 = document.createElement('h2');
      h2.className = 'hub-section__heading';
      h2.textContent = section.heading;
      headingRow.appendChild(h2);

      /* "Open All Staging Links" button for funnel sections */
      if (section.type === 'funnel') {
        var stagingUrls = [];
        section.rows.forEach(function (row) {
          row.links.forEach(function (link) {
            if (link.tag.toLowerCase() === 'staging') {
              stagingUrls.push(link.url);
            }
          });
        });
        if (stagingUrls.length > 1) {
          var openAllBtn = document.createElement('button');
          openAllBtn.className = 'open-all-btn';
          openAllBtn.textContent = 'Open All Staging Links';
          openAllBtn.addEventListener('click', function () {
            stagingUrls.forEach(function (url) {
              window.open(url, '_blank', 'noopener');
            });
          });
          headingRow.appendChild(openAllBtn);
        }
      }

      card.appendChild(headingRow);

      /* Rows */
      section.rows.forEach(function (row, rowIdx) {
        var rowEl = document.createElement('div');
        rowEl.className = 'asset-row';
        if (rowIdx % 2 === 1) {
          rowEl.classList.add('asset-row--alt');
        }

        /* Label */
        var label = document.createElement('div');
        label.className = 'asset-row__label';
        label.textContent = row.label;
        if (row.note) {
          var note = document.createElement('span');
          note.className = 'asset-row__note';
          note.textContent = '(' + row.note + ')';
          label.appendChild(note);
        }
        rowEl.appendChild(label);

        /* Content */
        var content = document.createElement('div');
        content.className = 'asset-row__content';

        if (section.type === 'funnel') {
          row.links.forEach(function (link) {
            var linkRow = document.createElement('div');
            linkRow.className = 'asset-link';

            var tag = document.createElement('span');
            tag.className = 'asset-link__tag asset-link__tag--' + link.tag.toLowerCase();
            tag.textContent = link.tag;
            linkRow.appendChild(tag);

            var a = document.createElement('a');
            a.className = 'asset-link__url';
            a.href = link.url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = cleanUrl(link.url);
            a.title = link.url;
            linkRow.appendChild(a);

            linkRow.appendChild(createOpenButton(link.url));
            content.appendChild(linkRow);
          });

        } else if (section.type === 'links') {
          var linkWrap = document.createElement('div');
          linkWrap.className = 'asset-row__single-link';

          var a = document.createElement('a');
          a.href = row.url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = cleanUrl(row.url);
          a.title = row.url;
          linkWrap.appendChild(a);

          linkWrap.appendChild(createOpenButton(row.url));
          content.appendChild(linkWrap);

        } else if (section.type === 'details') {
          var valWrap = document.createElement('div');
          valWrap.className = 'asset-row__detail';

          var val = document.createElement('p');
          val.className = 'asset-row__value';
          val.textContent = row.value;
          valWrap.appendChild(val);

          valWrap.appendChild(createCopyButton(row.value));
          content.appendChild(valWrap);
        }

        rowEl.appendChild(content);
        card.appendChild(rowEl);
      });

      container.appendChild(card);
    });

    /* Show content, hide loading */
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
  }
})();
