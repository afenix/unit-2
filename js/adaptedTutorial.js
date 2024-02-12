// ========================================================================
// Module 1; Lesson 2
// ========================================================================

// Declare the map variable in the global scope
let map;

// Initializes the Leaflet map and triggers the addition of GeoJSON data.
function createMap(){
    // Sets the initial view of the map to a global perspective
    map = L.map('map').setView([20.4637, 5.7492], 2);

    // Adds a tile layer to the map using Stadia Maps' Alidade Smooth tiles for terrain visualization.
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	    ext: 'png'
    }).addTo(map)

     // Initiates the retrieval and display of GeoJSON data by calling the getData function.
    getData();
};


// Defines the onEachFeature() function to enhance interactivity by binding a popup to each feature when clicked.
function onEachFeature(feature, layer) {
    // Initializes a string to store HTML content for the popup.
    var popupContent = "";
    // Checks if the feature has properties to be displayed.
    if (feature.properties) {
        // Iterates over each property of the feature, appending them as HTML paragraphs to the popupContent.
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        // Associates the constructed HTML content with the layer as a popup.
        layer.bindPopup(popupContent);
    }
}

// The getData() function is responsible for fetching and displaying the GeoJSON data on the map.
// It also applies custom styling to the point features.
function getData(){
  // Fetches GeoJSON data from the specified URL.
  fetch("data/MegaCities.geojson")
      .then(function(response){
          // Parses the JSON response.
          return response.json();
      })
      .then(function(json){
          // Defines marker options for styling the point features.
          var geojsonMarkerOptions = {
           radius: 8, // Sets the marker radius.
           fillColor: "#ff7800", // Sets the marker fill color.
           color: "#000", // Sets the stroke color.
           weight: 1, // Sets the stroke width.
           opacity: 1, // Sets the stroke opacity.
           fillOpacity: 0.8 // Sets the fill opacity.
          };
          // Creates a Leaflet GeoJSON layer with the data, applying the defined marker options and onEachFeature function.
          L.geoJson(json, {
              pointToLayer: function (feature, latlng){
                  return L.circleMarker(latlng, geojsonMarkerOptions);
              },
              onEachFeature: onEachFeature
          }).addTo(map); // Adds the GeoJSON layer to the map.
      });
};

// Ensures the map initialization happens after the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', createMap);
