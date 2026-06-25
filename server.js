require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

app.get("/api/weather/:city", async (req, res) => {
  try {
    const { city } = req.params;
    const { API_KEY } = process.env;

    if (!API_KEY) {
      throw new Error("API key is missing in .env file");
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    const [currentWeatherResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);

    if (!currentWeatherResponse.ok || !forecastResponse.ok) {
      throw new Error("City not found or API error");
    }

    const currentWeather = await currentWeatherResponse.json();
    const forecast = await forecastResponse.json();

    res.json({
      currentWeather,
      forecast,
    });
  } catch (error) {
    console.error("Error fetching weather data:", error.message);

    res.status(500).json({
      error: "Failed to fetch weather data. " + error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Weather backend server is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
