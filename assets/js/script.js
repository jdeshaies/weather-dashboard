var inputEl = $('input[name="city-input"]');
var searchButtonEl = $('#search-button');
var citySearched = ''
var searchLimit = 1;
var apiKey = '984f01ce82f22feac8fdecd70b3ccc45';
var coordinatesURL = '';

searchButtonEl.on('click', function (event) {
    event.preventDefault();
    citySearched = inputEl.val();
    console.log("City Name: " + inputEl.val());
    coordinatesURL = 'http://api.openweathermap.org/geo/1.0/direct?q='+citySearched+'&limit='+searchLimit+'&appid='+apiKey;
    console.log(coordinatesURL)
    returnCoordinates(coordinatesURL);
});



function returnCoordinates(coordinatesURL) {
    fetch(coordinatesURL)
    .then(function (response) {
      console.log(response);
      return response.json()
    })
    .then(function (data) {
        console.log(data);
      });
}
