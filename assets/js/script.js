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
var currentDayEl = $('#current-date');
var currentWeatherIconEl = $('#current-weather-icon');

//Variables needed for weather forecast
var forecastTempArray = [];
var dailyForecastObject = {};

//Creates a URL to request to cooridinates for the city entered when the search button is clicked
searchButtonEl.on('click', function (event) {
    event.preventDefault();
    citySearched = inputEl.val().trim();
    // console.log("City Name: " + inputEl.val());
    coordinatesURL = 'http://api.openweathermap.org/geo/1.0/direct?q='+citySearched+'&limit='+searchLimit+'&appid='+apiKey;
    // console.log(coordinatesURL)
    returnCoordinates(coordinatesURL);
});

//Returns the latitude and longitude of city entered based on URL in an object
function returnCoordinates(coordinatesURL) {
    fetch(coordinatesURL)
    .then(function (response) {
      // console.log(response);
      return response.json()
    })
    .then(function (data) {
        // console.log(data);
        latitude = data[0].lat;
        // console.log('Latitude: ' + latitude);
        longitude = data[0].lon;
        // console.log('Longitude: ' + longitude);
        coordinates.latitudeValue = latitude;
        coordinates.longitudeValue = longitude;
        // console.log(coordinates);
        returnCurrentWeather(coordinates);
        returnWeatherForecast(coordinates);
      });
}

//Creates the URL to request the current weather based on the coordinates and saves temperature, wind speed, and humidity based on the response
function returnCurrentWeather(coordinates) {
    // console.log('Start of current weather function');
    currentWeatherURL = 'https://api.openweathermap.org/data/2.5/weather?lat='+coordinates.latitudeValue+'&lon='+coordinates.longitudeValue+'&appid='+apiKey+'&units=imperial';
    fetch(currentWeatherURL)
    .then(function (response) {
      // console.log(response);
      return response.json()
    })
    .then(function (data) {
        // console.log(data);
        // currentWeather.time = data.dt;
        // currentWeather.timeZone = data.timezone;
        currentWeather.icon = data.weather[0].icon;
        currentWeather.temperature = data.main.temp;
        currentWeather.wind = data.wind.speed
        currentWeather.humidity = data.main.humidity;
        //console.log('UTC Time: ' + currentWeather.time);
        // console.log('Temperature: ' + currentWeather.temperature);
        // console.log('Wind: ' + currentWeather.wind)
        // console.log('Humididty: ' + currentWeather.humidity);
        displayCurrentWeather();
      });
}

//Displays the city name and current temperature, wind speed, and humidity
function displayCurrentWeather() {
    currentCityEl.html(citySearched);
    currentDayEl.html(dayjs().format('MM/DD/YYYY'));
    var iconURL = "http://openweathermap.org/img/w/"+currentWeather.icon.toString()+".png";
    // console.log(iconURL);
    currentWeatherIconEl.attr("src", iconURL);
    currentTempEl.html('Temp: ' + currentWeather.temperature.toString() + '&#176F');
    currentWindEl.html('Wind: ' + currentWeather.wind.toString() + ' MPH');
    currentHumidityEl.html('Humidity: ' + currentWeather.humidity.toString() + '%'); 
}

//LEFT OFF HERE. NOT SURE IF DISPLAYING AVERAGE OF HOURLY FORECASTS FOR 5 DAYS. TURN ON WEATHER FORECAST FUNCTION
function returnWeatherForecast(coordinates) {
  console.log('Start of weather forecast function');
  weatherForecastURL = 'https://api.openweathermap.org/data/2.5/forecast?lat='+coordinates.latitudeValue+'&lon='+coordinates.longitudeValue+'&appid='+apiKey+'&units=imperial';
  fetch(weatherForecastURL)
  .then(function (response) {
    console.log(response);
    return response.json()
  })
  .then(function (data) {
      console.log(data);
      var listLength = data.list.length
      console.log('List length: ' + listLength);
      lastValue = listLength-1;
      console.log('One less than list length: ' + lastValue);
      var maxTemp = 0;
      var objectCounter = 0;
      var firstDay = true;
      for (var i=0; i<data.list.length; i++) {
        console.log('Last Value: ' + lastValue);
        console.log('i: ' + i);
        var splitArray = data.list[i].dt_txt.split(' ');
        var forecastDate = splitArray[0];
        if (i != 0) {
          var splitArray2 = data.list[i-1].dt_txt.split(' ');
          var prevDay = splitArray2[0];
        }
        var temp = data.list[i].main.temp
        if (forecastDate !== dayjs().format('YYYY-MM-DD').toString()) {
          console.log('Loop #: ' + i);
          console.log('Forecast Date: ' + forecastDate);
          console.log('Prev Day: ' + prevDay);
          if (firstDay) {
            console.log('First iteration');
            maxTemp = temp;
            firstDay = false;
          }
          else if (i === lastValue) {
            console.log('Last Iteration');
            dailyForecastObject[objectCounter] = {date: forecastDate, highTemp: maxTemp};
          }
          else if (prevDay === forecastDate) {
            console.log('Prev day the same');
            if (temp > maxTemp) {
              console.log('New max temp of: ' + maxTemp);
              maxTemp = temp;
            }
          }
          else {
            console.log('New day');
            dailyForecastObject[objectCounter] = {date: prevDay, highTemp: maxTemp};
            maxTemp = 0;
            objectCounter++;
            console.log(dailyForecastObject);
          }
          console.log('Temp: ' + temp);
          console.log('Max Temp: ' + maxTemp);
        }
      }
      forecastTempArray.push(dailyForecastObject);
      console.log(forecastTempArray);
    });
}