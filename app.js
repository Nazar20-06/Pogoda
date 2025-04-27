// app.js (оновлений)
const apiKey = 'fad3d8660170b182a3261f2fcadd3815';

function clearBackground() {
    document.getElementById('background').innerHTML = '';
}

function createElement(className, extraStyles = {}) {
    const el = document.createElement('div');
    el.className = className;
    Object.assign(el.style, extraStyles);
    document.getElementById('background').appendChild(el);
}

function createCloud(type = 'cloud') {
    const cloud = document.createElement('div');
    cloud.className = type;
    cloud.style.top = `${Math.random() * 50}vh`;
    cloud.style.left = `${-200 + Math.random() * 100}vw`;
    cloud.style.animationDuration = `${40 + Math.random() * 30}s`;
    document.getElementById('background').appendChild(cloud);
}

function createLightning() {
    const lightning = document.createElement('div');
    lightning.className = 'lightning';
    document.getElementById('background').appendChild(lightning);
    setTimeout(() => lightning.remove(), 300);
}

function createFog() {
    const fog = document.createElement('div');
    fog.className = 'fog';
    document.getElementById('background').appendChild(fog);
}

function createStars() {
    for (let i = 0; i < 50; i++) {
        createElement('star', {
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`
        });
    }
}

function setBackground(weather, isDay) {
    clearBackground();
    document.body.style.background = isDay ? 'var(--day-bg)' : 'var(--night-bg)';

    if (weather === 'Clear') {
        isDay ? createElement('sun') : (createElement('moon') || createStars());
    } else if (weather === 'Clouds') {
        for (let i = 0; i < 5; i++) {
            createCloud(Math.random() > 0.5 ? 'fluffyCloud' : 'darkCloud');
        }
    } else if (weather === 'Rain') {
        for (let i = 0; i < 100; i++) {
            createElement('rain', {
                left: `${Math.random() * 100}vw`,
                animationDuration: `${0.5 + Math.random()}s`
            });
        }
        for (let i = 0; i < 3; i++) createCloud('darkCloud');
    } else if (weather === 'Snow') {
        for (let i = 0; i < 100; i++) {
            createElement('snowflake', {
                left: `${Math.random() * 100}vw`,
                animationDuration: `${5 + Math.random() * 5}s`
            });
        }
    } else if (weather === 'Thunderstorm') {
        for (let i = 0; i < 5; i++) {
            createCloud('darkCloud');
        }
        setInterval(() => createLightning(), 4000);
    } else if (weather === 'Mist' || weather === 'Fog' || weather === 'Haze') {
        createFog();
        for (let i = 0; i < 3; i++) createCloud('fluffyCloud');
    } else {
        for (let i = 0; i < 5; i++) {
            createCloud();
        }
    }
}

function setThemeByTimeAndWeather(data) {
    const dt = data.dt;
    const timezoneOffset = data.timezone;
    const localTimestamp = (dt + timezoneOffset) * 1000;
    const localTime = new Date(localTimestamp);
    const localHour = localTime.getUTCHours();

    const isDay = localHour >= 6 && localHour < 18;
    const weather = data.weather[0].main;
    setBackground(weather, isDay);
}

function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) {
        alert('Будь ласка, введіть місто!');
        return;
    }
    fetchWeather(city);
}

function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoords(lat, lon);
        }, () => {
            alert('Не вдалося отримати місцезнаходження.');
        });
    } else {
        alert('Ваш браузер не підтримує геолокацію.');
    }
}

function fetchWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ua`)
        .then(response => {
            if (!response.ok) throw new Error('Місто не знайдено');
            return response.json();
        })
        .then(data => {
            showWeather(data);
            setThemeByTimeAndWeather(data);
        })
        .catch(error => showError(error));
}

function fetchWeatherByCoords(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ua`)
        .then(response => response.json())
        .then(data => {
            showWeather(data);
            setThemeByTimeAndWeather(data);
        })
        .catch(error => showError(error));
}

function showWeather(data) {
    const weatherInfo = document.getElementById('weatherInfo');
    weatherInfo.innerHTML = `
        <h2>${data.name}</h2>
        <p>🌡 Температура: ${data.main.temp}°C</p>
        <p>🤗 Відчувається як: ${data.main.feels_like}°C</p>
        <p>💧 Вологість: ${data.main.humidity}%</p>
        <p>💨 Вітер: ${data.wind.speed} м/с</p>
        <p>🌤 Опис: ${data.weather[0].description}</p>
    `;
    weatherInfo.style.display = 'block';
}

function showError(error) {
    const weatherInfo = document.getElementById('weatherInfo');
    weatherInfo.innerHTML = `<p><b>Помилка:</b> ${error.message}</p>`;
    weatherInfo.style.display = 'block';
}
