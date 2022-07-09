/**
 * Show current bookmarks in the #currentBookmarks bar.
 */

const currentBookmarksElement = document.getElementById('currentBookmarks');

const faviconFolder = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="white" viewBox="0 0 16 16"><path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3zm-8.322.12C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139z"/></svg>';
const faviconEdit = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="white" viewBox="0 0 16 16"><path d="M2 15.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v13.5zM8 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z"/></svg>';

const getBookmarks = () => {
  try {
    return chrome.bookmarks.getTree().then(bookmarks => {
      const children = bookmarks[0].children;
      for (let i = 0; i < children.length; i++) {
        if (children[i].title === 'Bookmarks bar') {
          return children[i].children;
        }
      }
    });
  } catch (e) {
    console.log(e);
  }
}

const createBookmarksList = (bookmarks) => {
  const bookmarksList = document.createElement('ul');
  bookmarks.forEach(bookmark => {
    const bookmarkElement = document.createElement('li');
    const bookmarkLink = document.createElement('a');

    if (bookmark.url) {
      const bookmarkIcon = document.createElement('img');
      bookmarkIcon.width = '14';
      bookmarkIcon.height = '14';
      let faviconUrl = 'https://external-content.duckduckgo.com/ip3/'
      faviconUrl += bookmark.url.split('/')[2] + '.ico';
      bookmarkIcon.src = faviconUrl;
      bookmarkLink.href = bookmark.url;
      bookmarkLink.appendChild(bookmarkIcon);
    } else {
      bookmarkLink.href = '#';
      const folderIcon = document.createElement('span');
      folderIcon.innerHTML = faviconFolder;
      bookmarkLink.appendChild(folderIcon);
    }

    bookmarkLink.innerHTML += bookmark.title;
    bookmarkElement.appendChild(bookmarkLink);
    bookmarksList.appendChild(bookmarkElement);
    if (bookmark.children) {
      const childrenList = createBookmarksList(bookmark.children);
      bookmarkElement.appendChild(childrenList);
    }
  });
  return bookmarksList;
}

createBookmarksEditLink = () => {
  const bookmarksList = document.createElement('ul');
  const bookmarksListItem = document.createElement('li');
  const bookmarksEditItemLink = document.createElement('a');
  const bookmarksEditLinkIcon = document.createElement('span');

  bookmarksEditItemLink.target = '_blank';
  bookmarksEditItemLink.href = 'chrome://bookmarks';
  bookmarksEditItemLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://bookmarks' });
  });


  bookmarksEditLinkIcon.innerHTML = faviconEdit;
  bookmarksEditItemLink.appendChild(bookmarksEditLinkIcon);

  bookmarksEditItemLink.innerHTML += 'Edit';

  bookmarksListItem.appendChild(bookmarksEditItemLink);
  bookmarksList.appendChild(bookmarksListItem);

  return bookmarksList;
}


const updateCurrentBookmarks = () => {
  try {
    getBookmarks().then(bookmarks => {
      currentBookmarksElement.innerHTML = '';
      currentBookmarksElement.appendChild(createBookmarksList(bookmarks));
      currentBookmarksElement.appendChild(createBookmarksEditLink());
    });
  } catch (e) {
    console.log(e);
  }
}

updateCurrentBookmarks();


/**
 * Set the current time on the page.
 */
let currentTimeElement = document.getElementById('currentTime');

const updateTime = () => {
  const currentTime = new Date();

  let hours = currentTime.getHours();
  if (hours > 12) {
    hours -= 12;
  }

  let minutes = currentTime.getMinutes();
  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  const timeString = `${hours}:${minutes}`;
  currentTimeElement.innerHTML = timeString;
}

updateTime();
setInterval(updateTime, 1000);


/**
 * Set the current date on the page.
 */

let currentDateElement = document.getElementById('currentDate');

const updateDate = () => {
  const currentDate = new Date();

  let day = currentDate.getDay();
  let month = currentDate.getMonth();
  let dayOfMonth = currentDate.getDate();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  const dateString = `${dayNames[day]}, ${monthNames[month]} ${dayOfMonth}`;
  currentDateElement.innerHTML = dateString;
}

updateDate();
setInterval(updateDate, 1000);


/**
 * Set the current weather on the page by pulling it from AccuWeather.
 */

const currentWeatherElement = document.getElementById('currentWeather');

const fetchWeather = () => {
  fetch('https://www.accuweather.com/en/us/morganton/28655/weather-forecast/334823')
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const currentWeather = doc.querySelector('.forecast-container');

      const weatherIcon = currentWeather.querySelector('.weather-icon');
      weatherIcon.style.width = '128';
      weatherIcon.style.height = '128';

      const realFeel = currentWeather.querySelector('.real-feel');
      realFeel.remove();

      currentWeatherElement.innerHTML = currentWeather.innerHTML;

      const currentWeatherString = currentWeather.innerHTML;
      const currentWeatherObject = {
        timestamp: Date.now(),
        weather: currentWeatherString
      };
      chrome.storage.local.set({ currentWeather: currentWeatherObject });
    });
};

const getCurrentWeather = () => {
  chrome.storage.local.get('currentWeather', (result) => {
    const currentTimestamp = new Date()
    if (result.currentWeather) {
      if (currentTimestamp - result.currentWeather.timestamp < 1000 * 60 * 60) {
        currentWeatherElement.innerHTML = result.currentWeather.weather;
        return;
      }
    }
    fetchWeather();
  });
};

getCurrentWeather();
setInterval(getCurrentWeather, 1000 * 60 * 60);
