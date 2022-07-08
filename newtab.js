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

setInterval(updateTime, 1000);

updateTime();

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
