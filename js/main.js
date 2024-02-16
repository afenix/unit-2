// The following code is adapted from the Leaflet Geojson Tutorial by Leaflet.js (https://leafletjs.com/examples/geojson/)

/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map;
var minValue;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map-container').setView([45.53109574953526, -122.63896226979082], 12);
    // TODO: FIND/MAKE A HISTORIC BASEMAP OF PORTLAND (Consider possibility to change basemap based on time stamp of data being returned?)
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

    // Hide the welcome message when displaying new popup content
    var welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
    }
}

// Function to define behavior for each feature on the map.
function onEachFeature(feature, layer) {
    // Initialize an empty string to build HTML content for popups.
    var popupContent = "";
    // Check if the current feature has properties to display.
    if (feature.properties) {
        // Define an array of the specific property names you want to include.
        const includedProperties = ["NAME", "Vandalism_2015"];

         // Iterate over each property in the feature's properties.

         // Special handling for the "Name" property to make it an <h1>.
        if (feature.properties["NAME"]) {
            let neighborhood = feature.properties["NAME"];
            neighborhood = neighborhood.charAt(0).toUpperCase() + neighborhood.slice(1).toLowerCase();
            popupContent += `<h1>${neighborhood} Neighborhood</h1>`;
        }

        // Iterate over each property in the feature's properties.
        includedProperties.forEach(property => {
            // Skip the "Name" property since it's already handled.
            if (property !== "NAME" && feature.properties[property]) {
                // Concatenate the property name and value within the same <p> tag, using <span> for the value to differentiate styling if needed.
                popupContent += `<p><strong>Number of Vandalisms: </strong> <span style="font-size: 25px">${feature.properties[property]}</span></p>`;
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

function calculateMinValue(data) {
    let allValues = [];
    for (const crime of data.features) {
      for (let year = 2015; year <= 2023; year++) {
        const value = crime.properties["Vandalism_" + String(year)];
        console.log("value:", value); // Log value for debugging
        if (value) { // Check if value exists before pushing
          allValues.push(value);
        }
      }
    }
    const minValue = Math.min(...allValues);
    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 3;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    return radius;
};


function createPropSymbols(data) {
    const attribute = "Vandalism_2015";

    L.geoJson(data, {
      pointToLayer: (feature, latlng) => {
        const attValue = Number(feature.properties[attribute]);
        const radius = calcPropRadius(attValue); // Calculate radius
        return L.circleMarker(latlng, {
          radius, // Set radius based on value
          fillColor: "#ff7800", // Adjust color if desired
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        });
      },
      onEachFeature, // Use built-in onEachFeature
    }).addTo(map);
}

// The getData() function is responsible for fetching and displaying the GeoJSON data on the map.
// It also applies custom styling to the point features.
function getData(){
    fetch("data/data.geojson")
        .then(response => response.json())
        .then(json => {
            //calculate minimum data value
            minValue = calculateMinValue(json);

            //call function to create proportional symbols
           createPropSymbols(json);
        }).catch(error => console.error('Error loading GeoJSON data:', error));
};


// Ensures the map initialization happens after the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', createMap);







