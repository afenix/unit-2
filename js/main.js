// The following code is adapted from the Leaflet Geojson Tutorial by Leaflet.js (https://leafletjs.com/examples/geojson/)

/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map-container').setView([45.5182, -122.6684], 13);

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

 // Function to display popup content in the popup-container to the left of the map.
 // This function supercedes leaflet's default popup behavior of apppearing direcly on the map next to clicked object.
function showPopupContent(content) {
    var popupContainer = document.getElementById('popup-content'); // Get the container element
    popupContainer.innerHTML = content; // Update the container's inner HTML
    popupContainer.style.display = 'block'; // Make the container visible
}

// Function to define behavior for each feature on the map.
function onEachFeature(feature, layer) {
    // Initialize an empty string to build HTML content for popups.
    var popupContent = "";
    // Check if the current feature has properties to display.
    if (feature.properties) {
        // Define an array of the specific property names you want to include.
        const includedProperties = ["Name", "Date Operated", "Type", "Patronage", "Full Address", "Description"];

         // Iterate over each property in the feature's properties.

         // Special handling for the "Name" property to make it an <h1>.
        if (feature.properties["Name"]) {
            popupContent += `<h1>${feature.properties["Name"]}</h1>`;
        }

        // Iterate over each property in the feature's properties.
        includedProperties.forEach(property => {
            // Skip the "Name" property since it's already handled.
            if (property !== "Name" && feature.properties[property]) {
                // Concatenate the property name and value within the same <p> tag, using <span> for the value to differentiate styling if needed.
                popupContent += `<p><strong>${property}:</strong> <span>${feature.properties[property]}</span></p>`;
            }
        });

        popupContent += '</div>'; // Close the div for popup content.

        // Attach a click event listener to the current layer.
        // This listener will display the constructed HTML content in the popup-container
        // outside the map when the layer is clicked using the showPopupContent() function
        layer.on('click', function(e) {
            showPopupContent(popupContent);
        });
    };
};

// Create a icon object for custom icon
var mapIcon = L.icon({
    iconUrl: 'img/icon_flag.png',
    iconSize:     [32, 32], // size of the icon
    iconAnchor:  [12, 41], // point of the icon which will correspond to marker's location
});

// The getData() function is responsible for fetching and displaying the GeoJSON data on the map.
// It also applies custom styling to the point features.
function getData(){
    // Fetches GeoJSON data from the specified URL.
    fetch("data/QPDX.geojson")
        .then(function(response){
            // Parses the JSON response.
            return response.json();
        })
        .then(function(json){
            // Creates a Leaflet GeoJSON layer with the data, applying the defined marker options and onEachFeature function.
            L.geoJson(json, {
                pointToLayer: function (feature, latlng){
                    const hasDecadeProperty = feature.properties.hasOwnProperty("Decade");
                    if (hasDecadeProperty) {
                        return L.marker(latlng, {
                            icon: mapIcon
                        });
                    }
                },
                onEachFeature: onEachFeature,
                icon: mapIcon,
            }).addTo(map); // Adds the GeoJSON layer to the map.
        });
  };

  // Ensures the map initialization happens after the DOM is fully loaded.
  document.addEventListener('DOMContentLoaded', createMap);