const apiKey = '94b71f7fa42ea907e56b6f62e03d56e1';//openweathermap API key
const searchBtn = document.querySelector('#searchbtn'); 
const cityInput = document.getElementById('city');
const errorSpan = document.getElementById('error');
const liveloc=document.getElementById('livelocation')
const element = document.getElementById('weather-display');
const forecastContainer = document.querySelector('#next-days-weather');
const element2=document.querySelector('#wheather-5days');
let cities = JSON.parse(localStorage.getItem('weatherHistory')) || [];
window.addEventListener('DOMContentLoaded', updateCityDropdown);
//getting data for city weather for current
async function checkWeather(city) {
    //url for fetching data off current weather from openweathermap
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            element.classList.add('hidden');
            element2.classList.add('hidden');
            throw new Error("City not found. Please check the spelling!");   
        }
        
        const data = await response.json();
        cities.unshift(city);
        console.log(cities)
        console.log(data)
        const cityName = data.name; 

        // Only add if it's a new city
        if (!cities.includes(cityName)) {
            cities.unshift(cityName); 
            // Save the updated array to localStorage
            localStorage.setItem('weatherHistory', JSON.stringify(cities));
            updateCityDropdown();
        }
      
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
            element.classList.remove('hidden');
        }

        document.getElementById('icon').textContent = getWeatherEmoji(data.weather[0].main);
        
    } catch (error) {
        element.classList.add('hidden');
        element2.classList.add('hidden');
        console.error(error);
        errorSpan.textContent=error.message;
    }
}
//geting data of next 5 days weather
async function weatherof5days(city) {
    //url for fetching data off 5 days weather forcast from openweathermap
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const forecastRes = await fetch(forecastUrl);
        if (!forecastRes.ok) {
            forecastContainer.innerHTML = '';
            throw new Error("City not found. Please check the spelling!");
        
            
        }
const forecastData = await forecastRes.json();
console.log(forecastData);


forecastContainer.innerHTML = ''; 

// Filter to get data for 12:00 PM each day
const dailyData = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));

dailyData.forEach(day => {
    const date = new Date(day.dt * 1000);
    console.log(date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    // Create the HTML for each day card
    forecastContainer.innerHTML += `
         
      
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center hover:border-slate-600 transition-colors">
          <p class="text-slate-500 text-xs font-bold uppercase">${dayName}</p>
            <p class="text-3xl my-3">${getWeatherEmoji(day.weather[0].main)}</p>
            <p class="text-xl font-bold text-white">${Math.round(day.main.temp)}°C</p>
            <p class="text-sm text-white">${Math.round(day.main.humidity)}%</p>
            <p class="text-sm text-white">${Math.round(day.wind.speed)}kmph</p>
        </div>
        
    `;
});
        
    } catch (error) {
        console.error(error);
        element2.classList.add('hidden');
        errorSpan.textContent=error.message;
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
// eventlistener for search button
searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== "") {
        checkWeather(cityInput.value);
        weatherof5days(cityInput.value);
        element2.classList.remove('hidden');
       errorSpan.textContent="";
    } else {
       errorSpan.textContent="Please enter a city name";
       element.classList.add('hidden');
    }
});
//convert live geolocation to city
function getCityFromLiveLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            element.classList.add('hidden');
            reject(new Error("Geolocation not supported"));
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude: lat, longitude: lon } = position.coords;

            try {
                // Using OpenStreetMap (Nominatim) as you did
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
                );
                const data = await response.json();
                const city = data.address.city || data.address.town || data.address.village || data.address.state;
                
                resolve(city); // Success! Send the city name back
            } catch (error) {
                reject(error);
            }
        }, (error) => {
            reject(error);
        });
    });
}
// eventlistener for live location button
liveloc.addEventListener('click', async () => {
    errorSpan.textContent="fetching data......"
    try {
        const liveCity = await getCityFromLiveLocation();
        
        if (liveCity) {
            checkWeather(liveCity);
            weatherof5days(liveCity);
            errorSpan.textContent = "";
            element2.classList.remove('hidden');
        }
    } catch (error) {
        console.error(error);
        errorSpan.textContent = "Could not fetch live location.";
        element.classList.add('hidden');
        element2.classList.add('hidden');
    }
});
//update city to dropdown
function updateCityDropdown() {
    const dataList = document.getElementById('cities');
    if (!dataList) return; 

    dataList.innerHTML = '';

    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        dataList.appendChild(option);
    });
}
