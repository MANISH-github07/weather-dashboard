const API_KEY = "31821b41920e810ec8bbb8e82ec8c965";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const recentList = document.getElementById("recentList");

const currentDate = document.getElementById("currentDate");
const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");
const weatherDesc = document.getElementById("weatherDesc");
const weatherIcon = document.getElementById("weatherIcon");
const localTime = document.getElementById("localTime");

const mainTemp = document.getElementById("mainTemp");
const feelsLike = document.getElementById("feelsLike");
const tempCard = document.getElementById("tempCard");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const forecastBox = document.getElementById("forecast");

let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [
  "New York",
];

function setCurrentDate() {
  const date = new Date();
  currentDate.textContent = date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getWeatherEmoji(condition) {
  condition = condition.toLowerCase();

  if (condition.includes("clear")) return "☀️";
  if (condition.includes("cloud")) return "☁️";
  if (condition.includes("rain")) return "🌧️";
  if (condition.includes("storm") || condition.includes("thunder")) return "⛈️";
  if (condition.includes("snow")) return "❄️";
  if (condition.includes("mist") || condition.includes("fog")) return "🌫️";

  return "🌤️";
}

async function getWeather(city) {
  try {
    city = city.trim();

    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;

    const weatherRes = await fetch(weatherURL);
    const forecastRes = await fetch(forecastURL);

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    if (weatherData.cod === 401) {
      alert("Invalid API key. Please add correct OpenWeather API key.");
      return;
    }

    if (weatherData.cod === "404") {
      alert("City not found! Try city name like Mumbai, Delhi, Nagpur.");
      return;
    }

    if (!weatherRes.ok || !forecastRes.ok) {
      alert("Weather data not available.");
      return;
    }

    updateCurrentWeather(weatherData);
    updateForecast(forecastData);
    addRecentCity(weatherData.name);
  } catch (error) {
    alert("Network error. Check internet connection.");
    console.log(error);
  }
}

function updateCurrentWeather(data) {
  cityName.textContent = data.name;
  countryName.textContent = data.sys.country;

  const desc = data.weather[0].description;
  weatherDesc.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
  weatherIcon.textContent = getWeatherEmoji(desc);

  mainTemp.textContent = Math.round(data.main.temp);
  feelsLike.textContent = Math.round(data.main.feels_like);
  tempCard.textContent = Math.round(data.main.temp);
  humidity.textContent = data.main.humidity;
  windSpeed.textContent = Math.round(data.wind.speed * 3.6);

  const timezoneOffset = data.timezone;
  const local = new Date(Date.now() + timezoneOffset * 1000);
  localTime.textContent = local.toUTCString().slice(17, 22) + " LOCAL";
}

function updateForecast(data) {
  forecastBox.innerHTML = "";

  const dailyData = data.list.filter((item) =>
    item.dt_txt.includes("12:00:00"),
  );

  dailyData.slice(0, 5).forEach((day) => {
    const date = new Date(day.dt_txt);

    const card = document.createElement("div");
    card.className = "forecast-card";

    const condition = day.weather[0].main;
    const desc = day.weather[0].description;
    const temp = Math.round(day.main.temp);
    const minTemp = Math.round(day.main.temp_min);
    const precip = Math.round((day.pop || 0) * 100);

    card.innerHTML = `
      <h3>${date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}</h3>
      <p class="date">${date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}</p>

      <div class="icon">${getWeatherEmoji(condition)}</div>
      <p class="desc">${desc.charAt(0).toUpperCase() + desc.slice(1)}</p>

      <p class="degrees">
        <strong>${temp}°</strong>
        <span>${minTemp}°</span>
      </p>

      <div class="precip">
        precip <span style="float:right">${precip}%</span>
        <div class="progress">
          <div style="width:${precip}%"></div>
        </div>
      </div>
    `;

    forecastBox.appendChild(card);
  });
}

function addRecentCity(city) {
  recentCities = recentCities.filter(
    (item) => item.toLowerCase() !== city.toLowerCase(),
  );
  recentCities.unshift(city);
  recentCities = recentCities.slice(0, 5);

  localStorage.setItem("recentCities", JSON.stringify(recentCities));
  renderRecentCities();
}

function renderRecentCities() {
  recentList.innerHTML = "";

  recentCities.forEach((city) => {
    const item = document.createElement("div");
    item.className = "recent-item";
    item.textContent = "⌖ " + city;

    item.addEventListener("click", () => {
      getWeather(city);
    });

    recentList.appendChild(item);
  });
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (city === "") {
    alert("Please enter city name");
    return;
  }

  getWeather(city);
  cityInput.value = "";
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

setCurrentDate();
renderRecentCities();
getWeather("Wardha");
