const apiKey = '94b71f7fa42ea907e56b6f62e03d56e1';
const searchBtn = document.querySelector('#searchbtn'); 
const cityInput = document.getElementById('city');

async function checkWeather(city) {
    // 1. Corrected URL to the Weather Endpoint
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error("City not found. Please check the spelling!");
        }
        
        const data = await response.json();

        // 2. Updating your HTML elements
        // Note: OpenWeatherMap returns city name in 'data.name'
        document.getElementById('CityName').textContent = `${data.name}, ${data.sys.country}`;
        
        // Target the temperature,humidity,wind - using the specific ID
        const tempDisplay = document.querySelector('#temp'); 
        const humidDisplay=document.querySelector('#humid'); 
        const windDisplay=document.querySelector('#wind');
        const modeDisplay=document.querySelector('#mode');
        if (tempDisplay) {
            tempDisplay.textContent = `${Math.round(data.main.temp)}°C`;
            humidDisplay.textContent=`${Math.round(data.main.humidity)}%`;
            windDisplay.textContent=`${Math.round(data.wind.speed)}km/ph`;
            modeDisplay.textContent=`${data.weather[0].main}`;
        }

        document.getElementById('icon').textContent = getWeatherEmoji(data.weather[0].main);
        
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function getWeatherEmoji(condition) {
    const icons = { 
        'Clear': '☀️', 
        'Clouds': '☁️', 
        'Rain': '🌧️', 
        'Drizzle': '🌦️',
        'Thunderstorm': '🌩️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Haze': '🌫️',
    };
    return icons[condition] || '🌡️';
}

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== "") {
        checkWeather(cityInput.value);
        const element = document.getElementById('weather-display');
// Remove a single class
       element.classList.remove('hidden');
    } else {
        alert("Please enter a city name");
    }
});