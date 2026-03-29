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
      /* Remove trailing slash unless it's the only path */
      if (display.length > 1 && display.endsWith('/')) {
        display = display.slice(0, -1);
      }
      return display;
    } catch (e) {
      return url;
    }
  }

  function createCopyButton(text) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('title', 'Copy full URL');
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

    /* Table of Contents */
    var tocList = document.getElementById('tocList');
    d.sections.forEach(function (section) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      var id = slugify(section.heading);
      a.href = '#' + id;
      a.textContent = section.heading;
      li.appendChild(a);
      tocList.appendChild(li);
    });

    /* Sections */
    var container = document.getElementById('sectionsContainer');
    d.sections.forEach(function (section) {
      var card = document.createElement('div');
      card.className = 'hub-section';
      card.id = slugify(section.heading);

      /* Section heading */
      var h2 = document.createElement('h2');
      h2.className = 'hub-section__heading';
      h2.textContent = section.heading;
      card.appendChild(h2);

      /* Rows */
      section.rows.forEach(function (row) {
        var rowEl = document.createElement('div');
        rowEl.className = 'asset-row';

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
          /* Funnel URLs: multiple tagged links */
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

            linkRow.appendChild(createCopyButton(link.url));
            content.appendChild(linkRow);
          });

        } else if (section.type === 'links') {
          /* Single link rows */
          var linkWrap = document.createElement('div');
          linkWrap.className = 'asset-row__single-link';

          var a = document.createElement('a');
          a.href = row.url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = cleanUrl(row.url);
          a.title = row.url;
          linkWrap.appendChild(a);

          linkWrap.appendChild(createCopyButton(row.url));
          content.appendChild(linkWrap);

        } else if (section.type === 'details') {
          /* Key-value text rows */
          var val = document.createElement('p');
          val.className = 'asset-row__value';
          val.textContent = row.value;
          content.appendChild(val);
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
