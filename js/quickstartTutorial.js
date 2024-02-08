// The following code is adapted from the Leaflet Geojson Tutorial by Leaflet.js (https://leafletjs.com/examples/quick-start/)

// Initialize the map
var map = L.map('map').setView([51.5, -0.09], 13);
// Add a tile layer to the map using stadia terrain base map tiles
L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
}).addTo(map)

// Create variable with a marker and add it to the map
var marker = L.marker([51.5, -0.09]).addTo(map);

// Create a simple styled circle and add it to the map
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

// Create a polygon and add it to the map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

// Bind popPopup messages to the marker, circle and polygon
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//Create a stand alone popup
var popup = L.popup()
    .setLatLng([51.513, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

// This is an example of a function that can be passed to the map.
// In this case, the function returns an alert message with the latitude and longitude of the clicked point.
// It demonstrates that each object on the map has its own set of events, such as the latitude and longitude of the point.
function simpleOnMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}
// Attach the 'simpleOnMapClick' function to the 'click' event of the map
map.on('click', simpleOnMapClick);

// Create a new instance of the L.popup() class to create a popup object.
var popup = L.popup();

// Create a function that adds a popup message when the map is clicked
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);