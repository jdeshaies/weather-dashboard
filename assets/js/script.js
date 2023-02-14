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
var forecastArray = [];
var dailyForecastObject = {};
var fiveDayForecastEl = $('#five-day-forecast');

//Variables for searchHistory

var searchHistory = [];
var searchHistoryListEl = $('.search-history');

renderSearchHistory();

//Creates a URL to request to cooridinates for the city entered when the search button is clicked and saves city to array in local storage
searchButtonEl.on('click', function (event) {
    event.preventDefault();
    citySearched = inputEl.val().trim();
    if (citySearched){
      inputEl.val('');
      fiveDayForecastEl.empty();
      searchHistoryListEl.prepend('<button class="btn btn-block btn-secondary w-100 my-2">'+citySearched+'</button>');
      searchHistory.unshift(citySearched);
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
      // console.log("City Name: " + inputEl.val());
      coordinatesURL = 'http://api.openweathermap.org/geo/1.0/direct?q='+citySearched+'&limit='+searchLimit+'&appid='+apiKey;
      // console.log(coordinatesURL)
      returnCoordinates(coordinatesURL);
    }
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
    $('.current-forecast').attr("class", "border border-dark px-2");
    currentCityEl.html(citySearched);
    currentDayEl.html('('+dayjs().format('M/DD/YYYY')+')');
    var iconURL = "http://openweathermap.org/img/w/"+currentWeather.icon.toString()+".png";
    // console.log(iconURL);
    currentWeatherIconEl.attr("src", iconURL);
    currentTempEl.html('Temp: ' + currentWeather.temperature.toString() + '&#176F');
    currentWindEl.html('Wind: ' + currentWeather.wind.toString() + ' MPH');
    currentHumidityEl.html('Humidity: ' + currentWeather.humidity.toString() + '%'); 
}

//Creates an object where the key is the date of the five day forecast and the value is the max temp for that day
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
      // console.log('List length: ' + listLength);
      lastValue = listLength-1;
      // console.log('One less than list length: ' + lastValue);
      var maxTemp = 0;
      var maxWindSpeed = 0;
      var maxHumidity = 0;
      var objectCounter = 0;
      var firstDay = true;
      for (var i=0; i<data.list.length; i++) {
        // console.log('Last Value: ' + lastValue);
        // console.log('i: ' + i);
        var splitArray = data.list[i].dt_txt.split(' ');
        var forecastDate = changeDateFormat(splitArray[0]);
        console.log('Updated date: ' + forecastDate);
        if (i != 0) {
          var splitArray2 = data.list[i-1].dt_txt.split(' ');
          var prevDay = changeDateFormat(splitArray2[0]);
        }
        var forecastTemp = data.list[i].main.temp;
        var forecastWindSpeed = data.list[i].wind.speed;
        var forecastHumidity = data.list[i].main.humidity;
        if (forecastDate !== dayjs().format('M/DD/YYYY').toString()) {
          // console.log('Loop #: ' + i);
          // console.log('Forecast Date: ' + forecastDate);
          // console.log('Prev Day: ' + prevDay);
          if (firstDay) {
            // console.log('First iteration');
            maxTemp = forecastTemp;
            maxWindSpeed = forecastWindSpeed;
            maxHumidity = forecastHumidity;
            firstDay = false;
          }
          else if (i === lastValue) {
            // console.log('Last Iteration');
            dailyForecastObject[objectCounter] = {
              date: prevDay, 
              topTemp: maxTemp,
              topWindSpeed: maxWindSpeed,
              topHumidity: maxHumidity
            };
          }
          else if (prevDay === forecastDate) {
            // console.log('Prev day the same');
            if (forecastTemp > maxTemp) {
              // console.log('New max temp of: ' + maxTemp);
              maxTemp = forecastTemp;
            };
            if (forecastWindSpeed > maxWindSpeed) {
              // console.log('New max temp of: ' + maxTemp);
              maxWindSpeed = forecastWindSpeed;
            };
            if (forecastHumidity > maxHumidity) {
              // console.log('New max temp of: ' + maxTemp);
              maxHumidity = forecastHumidity;
            };
          }
          else {
            // console.log('New day');
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
            // console.log(dailyForecastObject);
          }
          // console.log('Temp: ' + temp);
          // console.log('Max Temp: ' + maxTemp);
        }
      }
      forecastArray.push(dailyForecastObject);
      console.log(forecastArray);
      displayFiveDayForecast();
    });
}

function displayFiveDayForecast() {
  console.log('Start of display five day function');
  fiveDayForecastEl.append('<h2>5 Day Forecast:</h2>');
  fiveDayForecastEl.append('<div class="forecast-container pr-2 d-flex justify-content-between"></div>');
  for (var x=0; x < Object.keys(forecastArray[0]).length; x++) {
    // console.log(x + ': ' + forecastArray[0][x]);
    dayNum = x + 1;
    $('.forecast-container').append('<div class="bg-dark text-white" id="day-'+dayNum.toString()+'-forecast"></div>');
    $('#day-'+dayNum+'-forecast').append('<p class="h4">'+forecastArray[0][x].date+'</p>');
    $('#day-'+dayNum+'-forecast').append('<p class="h6">Temp: '+forecastArray[0][x].topTemp+'&#176F</p>');
    $('#day-'+dayNum+'-forecast').append('<p class="h6">Wind: '+forecastArray[0][x].topWindSpeed+' MPH</p>');
    $('#day-'+dayNum+'-forecast').append('<p class="h6">Humidity: '+forecastArray[0][x].topHumidity+' %</p>');
  }
  console.log('end of display five day function');
}

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

function renderSearchHistory() {
  // Use JSON.parse() to convert text to JavaScript object
  var searchHistoryLocalStorage = JSON.parse(localStorage.getItem("searchHistory"));
  // Check if data is returned, if not exit out of the function
  if (searchHistoryLocalStorage !== null) {
    searchHistory = searchHistoryLocalStorage;
    // console.log(searchHistory); 
  }
  for (var i = 0; i<searchHistory.length; i++){
    searchHistoryListEl.append('<button class="btn btn-block btn-secondary w-100 my-2">'+searchHistory[i]+'</button>');
  }

}
