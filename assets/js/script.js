var inputEl = $('input[name="city-input"]');
var searchButtonEl = $('#search-button');
var currentCityEl = $('#current-city');
var currentTempEl = $('#current-temp');
var currentWindEl = $('#current-wind');
var currentHumidityEl = $('#current-humidity');
var citySearched = ''
var searchLimit = 1;
var apiKey = '984f01ce82f22feac8fdecd70b3ccc45';

//Variables needed for coordinates
var coordinatesURL = '';
var latitude = '';
var longitude = '';
var coordinates = {};

//Variables needed for current weather
var currentWeatherURL = '';
var currentWeather = {};

console.log('Inner HTML before function: ' + currentCityEl.innerHTML);

//Creates a URL to request to cooridinates for the city entered when the search button is clicked
searchButtonEl.on('click', function (event) {
    event.preventDefault();
    citySearched = inputEl.val();
    console.log("City Name: " + inputEl.val());
    coordinatesURL = 'http://api.openweathermap.org/geo/1.0/direct?q='+citySearched+'&limit='+searchLimit+'&appid='+apiKey;
    console.log(coordinatesURL)
    returnCoordinates(coordinatesURL);
});

//Returns the latitude and longitude of city entered based on URL in an object
function returnCoordinates(coordinatesURL) {
    fetch(coordinatesURL)
    .then(function (response) {
      console.log(response);
      return response.json()
    })
    .then(function (data) {
        console.log(data);
        latitude = data[0].lat;
        console.log('Latitude: ' + latitude);
        longitude = data[0].lon;
        console.log('Longitude: ' + longitude);
        coordinates.latitudeValue = latitude;
        coordinates.longitudeValue = longitude;
        console.log(coordinates);
        returnCurrentWeather(coordinates);
      });
}

function returnCurrentWeather(coordinates) {
    console.log('Start of current weather function');
    currentWeatherURL = 'https://api.openweathermap.org/data/2.5/weather?lat='+coordinates.latitudeValue+'&lon='+coordinates.longitudeValue+'&appid='+apiKey+'&units=imperial';
    fetch(currentWeatherURL)
    .then(function (response) {
      console.log(response);
      return response.json()
    })
    .then(function (data) {
        console.log(data);
        currentWeather.temperature = data.main.temp;
        currentWeather.wind = data.wind.speed
        currentWeather.humidity = data.main.humidity;
        console.log('Temperature: ' + currentWeather.temperature);
        console.log('Wind: ' + currentWeather.wind)
        console.log('Humididty: ' + currentWeather.humidity);
        displayCurrentWeather();
      });
}
function displayCurrentWeather() {
    console.log('test');
    currentCityEl.innerHTML = citySearched;
    console.log('Current city inner HTML after function: ' + currentCityEl.innerHTML);
    currentTempEl.innerHTML = currentWeather.temperature;
    currentWindEl.innerHTML = currentWeather.wind;
    currentHumidityEl.innerHTML = currentWeather.humidity; 
}
