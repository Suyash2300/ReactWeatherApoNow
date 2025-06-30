import { useEffect, useState } from "react";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiThunderstorm,
  WiSnow,
  WiFog,
} from "react-icons/wi";
import { FaSearch, FaMoon, FaSun } from "react-icons/fa";

// ✅ Correct
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const storedHistory =
      JSON.parse(localStorage.getItem("weatherHistory")) || [];
    setHistory(storedHistory);
  }, []);

  // Load current location weather on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      fetchWeatherByCoords(latitude, longitude);
    });
  }, []);

  const fetchWeather = async (searchCity) => {
    const cityToSearch = (searchCity || city).trim();
    if (!cityToSearch) {
      alert("Please enter a city name!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityToSearch}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod === 200) {
        setWeather(data);
        fetchForecast(cityToSearch);
        updateHistory(cityToSearch);
      } else {
        alert("City not found ❌");
      }
    } catch (err) {
      alert("Something went wrong.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod === 200) {
        setWeather(data);
        fetchForecast(data.name);
        updateHistory(data.name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (cityName) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      const daily = data.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );
      setForecast(daily);
    } catch (err) {
      console.error("Forecast error:", err);
    }
  };

  const updateHistory = (newCity) => {
    const updated = [newCity, ...history.filter((c) => c !== newCity)].slice(
      0,
      5
    );
    setHistory(updated);
    localStorage.setItem("weatherHistory", JSON.stringify(updated));
  };

  const getWeatherIcon = (condition) => {
    condition = condition.toLowerCase();
    if (condition.includes("clear")) return <WiDaySunny size={60} />;
    if (condition.includes("cloud")) return <WiCloud size={60} />;
    if (condition.includes("rain")) return <WiRain size={60} />;
    if (condition.includes("thunder")) return <WiThunderstorm size={60} />;
    if (condition.includes("snow")) return <WiSnow size={60} />;
    if (condition.includes("mist") || condition.includes("fog"))
      return <WiFog size={60} />;
    return <WiDaySunny size={60} />;
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white p-6 transition-all duration-300">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">🌤️ Weather App</h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-xl p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Enter city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="p-2 rounded border dark:bg-gray-700 dark:text-white flex-grow"
            />
            <button
              onClick={() => fetchWeather()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-1"
            >
              <FaSearch /> Search
            </button>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="mb-1">Recent Searches:</p>
              <div className="flex gap-2 flex-wrap">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded"
                    onClick={() => fetchWeather(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center mt-6">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-b-4 mx-auto mb-2" />
              <p>Loading...</p>
            </div>
          )}

          {/* Current Weather */}
          {!loading && weather && (
            <div className="bg-white dark:bg-gray-700 rounded p-6 shadow-md text-center space-y-4 animate-fade-in">
              <h2 className="text-2xl font-semibold">{weather.name}</h2>
              <div className="flex justify-center text-blue-600 dark:text-blue-400">
                {getWeatherIcon(weather.weather[0].main)}
              </div>
              <p className="capitalize">{weather.weather[0].description}</p>
              <p className="text-3xl font-bold">{weather.main.temp}°C</p>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>💧 {weather.main.humidity}%</span>
                <span>💨 {weather.wind.speed} m/s</span>
              </div>
            </div>
          )}

          {/* Forecast */}
          {!loading && forecast.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 animate-slide-in">
              {forecast.map((item) => (
                <div
                  key={item.dt}
                  className="bg-white dark:bg-gray-700 rounded p-3 text-center space-y-1 shadow"
                >
                  <p className="font-semibold">
                    {new Date(item.dt_txt).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </p>
                  <img
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                    alt="icon"
                    className="mx-auto w-12"
                  />
                  <p>{item.main.temp}°C</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
