var inputEl = $('input[name="city-input"]');
var searchButtonEl = $('#search-button');

searchButtonEl.on('click', function (event) {
    event.preventDefault();
    console.log("City Name: " + inputEl.val());
});

