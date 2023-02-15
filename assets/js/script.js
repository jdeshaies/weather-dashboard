// Variables related to form where user enters a city 
var inputEl = $('input[name="city-input"]');
var searchButtonEl = $('#search-button');

// Variables related to API
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
var currentCityEl = $('#current-city');
var currentTempEl = $('#current-temp');
var currentWindEl = $('#current-wind');
var currentHumidityEl = $('#current-humidity');
var citySearched = ''

//Variables needed for weather forecast
var forecastArray = [];
var dailyForecastObject = {};
var fiveDayForecastEl = $('#five-day-forecast');

//Variables for searchHistory
var searchHistory = [];
var searchHistoryListEl = $('.search-history');

//Checks for previously searched cities in local storage first
renderSearchHistory();

//Creates a URL to request to cooridinates for the city entered when the search button is clicked and saves city to array in local storage
searchButtonEl.on('click', function (event) {
    event.preventDefault();
    citySearched = inputEl.val().trim();
    if (citySearched){
      inputEl.val('');
      createCoordinatesURL(citySearched);
    }
});

//Returns the URL needed to retrieve the city coordinates based on the city entered in the form
function createCoordinatesURL(citySearched){
  fiveDayForecastEl.empty();
  searchHistoryListEl.prepend('<button class="btn btn-block btn-secondary w-100 my-2">'+citySearched+'</button>');
  searchHistory.unshift(citySearched);
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  coordinatesURL = 'http://api.openweathermap.org/geo/1.0/direct?q='+citySearched+'&limit='+searchLimit+'&appid='+apiKey;
  returnCoordinates(coordinatesURL);
}

//Returns the latitude and longitude of city entered based on URL in an object
function returnCoordinates(coordinatesURL) {
    fetch(coordinatesURL)
    .then(function (response) {
      return response.json()
    })
    .then(function (data) {
        latitude = data[0].lat;
        longitude = data[0].lon;
        coordinates.latitudeValue = latitude;
        coordinates.longitudeValue = longitude;
        returnCurrentWeather(coordinates);
        returnWeatherForecast(coordinates);
      });
}

//Creates the URL to request the current weather based on the coordinates and saves temperature, wind speed, and humidity based on the response
function returnCurrentWeather(coordinates) {
    currentWeatherURL = 'https://api.openweathermap.org/data/2.5/weather?lat='+coordinates.latitudeValue+'&lon='+coordinates.longitudeValue+'&appid='+apiKey+'&units=imperial';
    fetch(currentWeatherURL)
    .then(function (response) {
      return response.json()
    })
    .then(function (data) {
        currentWeather.icon = data.weather[0].icon;
        currentWeather.temperature = data.main.temp;
        currentWeather.wind = data.wind.speed
        currentWeather.humidity = data.main.humidity;
        displayCurrentWeather();
      });
}

//Displays the city name and current temperature, wind speed, and humidity
function displayCurrentWeather() {
    $('.current-forecast').attr("class", "border border-dark px-2");
    currentCityEl.html(citySearched);
    currentDayEl.html('('+dayjs().format('M/DD/YYYY')+')');
    var iconURL = "http://openweathermap.org/img/w/"+currentWeather.icon.toString()+".png";
    currentWeatherIconEl.attr("src", iconURL);
    currentTempEl.html('Temp: ' + currentWeather.temperature.toString() + '&#176F');
    currentWindEl.html('Wind: ' + currentWeather.wind.toString() + ' MPH');
    currentHumidityEl.html('Humidity: ' + currentWeather.humidity.toString() + '%'); 
}

//Creates an object where the key is the date of the five day forecast and the value is the max temp for that day
function returnWeatherForecast(coordinates) {
  weatherForecastURL = 'https://api.openweathermap.org/data/2.5/forecast?lat='+coordinates.latitudeValue+'&lon='+coordinates.longitudeValue+'&appid='+apiKey+'&units=imperial';
  fetch(weatherForecastURL)
  .then(function (response) {
    console.log(response);
    return response.json()
  })
  .then(function (data) {
      var listLength = data.list.length
      lastValue = listLength-1;
      var maxTemp = 0;
      var maxWindSpeed = 0;
      var maxHumidity = 0;
      var objectCounter = 0;
      var firstIteration = true;
      //Loops through each 3-hour iteration of the five day forecast to obtain the high temp, wind speed, and humidity for each day
      for (var i=0; i<data.list.length; i++) {
        var splitArray = data.list[i].dt_txt.split(' ');
        var forecastDate = changeDateFormat(splitArray[0]);
        if (i != 0) {
          var splitArray2 = data.list[i-1].dt_txt.split(' ');
          var prevDay = changeDateFormat(splitArray2[0]);
        }
        var forecastTemp = data.list[i].main.temp;
        var forecastWindSpeed = data.list[i].wind.speed;
        var forecastHumidity = data.list[i].main.humidity;
        //Only includes days that are not the current day so the current day won't be shown in the five day forecast
        if (forecastDate !== dayjs().format('M/DD/YYYY').toString()) { 
          // Makes all values the max value since it is the first 3-hour iteration checked and does not have previous value to compare
          if (firstIteration) {
            maxTemp = forecastTemp;
            maxWindSpeed = forecastWindSpeed;
            maxHumidity = forecastHumidity;
            firstIteration = false;
          }
          else if (i === lastValue) {
            dailyForecastObject[objectCounter] = {
              date: prevDay, 
              topTemp: maxTemp,
              topWindSpeed: maxWindSpeed,
              topHumidity: maxHumidity
            };
          }
          else if (prevDay === forecastDate) {
            if (forecastTemp > maxTemp) {
              maxTemp = forecastTemp;
            };
            if (forecastWindSpeed > maxWindSpeed) {
              maxWindSpeed = forecastWindSpeed;
            };
            if (forecastHumidity > maxHumidity) {
              maxHumidity = forecastHumidity;
            };
          }
          else {
            dailyForecastObject[objectCounter] = {
              date: prevDay, 
              topTemp: maxTemp,
              topWindSpeed: maxWindSpeed,
              topHumidity: maxHumidity
            };
            maxTemp = 0;
            maxWindSpeed = 0;
            maxHumidity = 0;
            objectCounter++;
          }
        }
      }
      forecastArray.push(dailyForecastObject);
      console.log(forecastArray);
      displayFiveDayForecast();
    });
}

//Displays the five day forecast of the city searched
function displayFiveDayForecast() {
  fiveDayForecastEl.append('<h2>5 Day Forecast:</h2>');
  fiveDayForecastEl.append('<div class="forecast-container pr-2 d-flex justify-content-between"></div>');
  for (var x=0; x < Object.keys(forecastArray[0]).length; x++) {
    dayNum = x + 1;
    $('.forecast-container').append('<div class="bg-dark text-white" id="day-'+dayNum.toString()+'-forecast"></div>');
    $('#day-'+dayNum+'-forecast').append('<p class="h4">'+forecastArray[0][x].date+'</p>');
    $('#day-'+dayNum+'-forecast').append('<p class="h6">Temp: '+forecastArray[0][x].topTemp+'&#176F</p>');
    $('#day-'+dayNum+'-forecast').append('<p class="h6">Wind: '+forecastArray[0][x].topWindSpeed+' MPH</p>');
    $('#day-'+dayNum+'-forecast').append('<p class="h6">Humidity: '+forecastArray[0][x].topHumidity+' %</p>');
  }
}

// Changes the format of the date pulled from the API to be in MM/DD/YYYY format instead of YYYY-MM-DD
function changeDateFormat(strDate) {
  var dateArray = strDate.split('-');
  var year = dateArray[0];
  var month = dateArray[1];
  if (month[0]= 2) {
    month = month.slice(1)
  }
  var day = dateArray[2];
  var newDate = month+'/'+day+'/'+year;
  return newDate;
}

//Takes the search history in the local storage and creates buttons of the cities
function renderSearchHistory() {
  var searchHistoryLocalStorage = JSON.parse(localStorage.getItem("searchHistory"));
  if (searchHistoryLocalStorage !== null) {
    searchHistory = searchHistoryLocalStorage;
  }
  for (var i = 0; i<searchHistory.length; i++){
    searchHistoryListEl.prepend('<button class="btn btn-block btn-secondary w-100 my-2">'+searchHistory[i]+'</button>');
  }
}

// Adds event listener to search history button and displays weather for that city when clicked
$('.btn-secondary').each(function(){
  $(this).click(function(){
    console.log('Inner HTML: '+ $(this).html());
    citySearched = $(this).html();
    console.log(citySearched);
    createCoordinatesURL(citySearched);
  })
})

