chrome.extension.sendMessage({}, function(response) {
	let readyStateCheckInterval = setInterval(function() {
		if (document.querySelector('.HeaderMenu')) {
      clearInterval(readyStateCheckInterval);
      window.onpopstate = render;
      render();
		}
	}, 10);
});

function save(bookmarks, cb) {
  chrome.storage.sync.set({ 'github-bookmarks': bookmarks}, cb);
}

function load(cb) {
  chrome.storage.sync.get('github-bookmarks', (results) => {
    cb(results['github-bookmarks']);
  });
}

function render() {
  load((bookmarks) => {
    if (!Array.isArray(bookmarks)) {
      bookmarks = [];
      save(bookmarks);
    }

    let container = document.querySelector('.HeaderMenu ul[role="navigation"]');
    container.innerHTML = '';
    container.setAttribute('style', 'flex: 1 0 auto; align-items: stretch !important;');
    container.parentElement.setAttribute('style', 'flex: 1 0 auto');

    bookmarks.forEach((bookmark) => {
      let linkContainer = document.createElement('div');
      linkContainer.className = 'gsb-link-container';
      container.append(linkContainer);

      let link = document.createElement('a');
      link.className = 'gsb-link';
      link.href = `https://github.com/${ bookmark }`;
      link.innerText = bookmark.split('/')[1];
      linkContainer.append(link);

      let dropdown = document.createElement('div');
      dropdown.className = 'gsb-dropdown';
      linkContainer.append(dropdown);
      dropdown.innerHTML = `
        <div class='gsb-dropdown-row'>
          <a href='https://github.com/${ bookmark }/issues' class='gsb-dropdown-row-main-link'>
            Issues
          </a>
          <a href='https://github.com/${ bookmark }/issues/new' class='gsb-dropdown-row-new-link'>
            +
          </a>
        </div>
        <div class='gsb-dropdown-row'>
          <a href='https://github.com/${ bookmark }/pulls' class='gsb-dropdown-row-main-link'>
            Pull Requests
          </a>
          <a href='https://github.com/${ bookmark }/compare' class='gsb-dropdown-row-new-link'>
            +
          </a>
        </div>
      `;
    });

    if (isRepoUrl()) {
      let slug = window.location.pathname.slice(1);
      if (bookmarks.includes(slug)) {
        let removeButton = document.createElement('button');
        removeButton.className = 'gsb-add-button';
        removeButton.innerText = 'Remove';
        removeButton.onclick = function() {
          bookmarks = bookmarks.filter((b) => b !== slug);
          save(bookmarks, render);
        }
        container.append(removeButton);
      } else {
        let addButton = document.createElement('button');
        addButton.className = 'gsb-add-button';
        addButton.innerText = 'Add';
        addButton.onclick = function() {
          bookmarks.push(slug);
          save(bookmarks, render);
        }
        container.append(addButton);
      }
    }


  });
}

function isRepoUrl() {
  return window.location.pathname.match(/^\/[^\/]+\/[^\/]+$/);
}