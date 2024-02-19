
// Declare global variables for the map and min/max values
let map;
let minValue;
let maxValue;

document.addEventListener('DOMContentLoaded', function () {
    var splashScreen = document.getElementById('splash-screen');
    var closeButton = document.getElementById('close-splash');

    closeButton.addEventListener('click', function () {
        splashScreen.style.display = 'none';
    });
});
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


function pointToLayer(feature, latlng, attributes) {
    // Step 4: Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    // Example attribute value, replace with dynamic calculation if needed
    var attValue = Number(feature.properties[attribute]);

    // Calculate the radius of the circle marker, here just an example
    var radius = calcPropRadius(attValue);

    // Create and return a circleMarker layer
    return L.circleMarker(latlng, {
        radius: radius, // Use the calculated radius
        fillColor: "#ff7800", // Customize color
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    });
}

function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        },
        // onEachFeature: onEachFeature
    }).addTo(map);
};

function createSequenceControls(attributes){
    //create range input element (slider)
    document.querySelector('.range').addEventListener('input', function() {
        let index = this.value;
        let key = attributes[index];

        let year = key.slice(-4); // Extract the year part
        console.log('year', year);
        document.getElementById('rangeValue').textContent = `Year: ${year}`;
        updatePropSymbols(attributes[index]);
    });

    //TODO: NEED TO MAKE SURE THAT 2015 is FIRST YEAR ON PAGE LOAD

    // Initialize the displayed year when the page loads or when the slider is first displayed
    document.addEventListener('DOMContentLoaded', function() {
        let initialYear = document.querySelector('.range').value;
        console.log('initialYear:', initialYear)
        document.getElementById('rangeValue').textContent = `Year: ${initialYear}`;
    });

    document.querySelectorAll('.button').forEach(function(button) {
        button.addEventListener("click", function() {
            let slider = document.querySelector('.range');
            let index = parseInt(slider.value, 10); // Current slider value as index

            if (button.id === 'forward') {
                // Increment index, ensuring it doesn't exceed the maximum value
                index = index >= attributes.length - 1 ? attributes.length - 1 : index + 1;
            } else if (button.id === 'reverse') {
                // Decrement index, ensuring it doesn't go below 0
                index = index <= 0 ? 0 : index - 1;
            }

            // Update the slider's value and displayed year after adjusting the index
            slider.value = index;
            let year = attributes[index].slice(-4); // Extract the year part after index has been adjusted
            document.getElementById('rangeValue').textContent = `Year: ${year}`;

            // Call the function to update your map or other elements based on the new attribute
            updatePropSymbols(attributes[index]);

            console.log('Index after click:', index);
            console.log('Year after click:', year);
        });
    });
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>Neighborhood:</b> " + props.NAME + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Number of vandalisms in " + year + ":</b> " + props[attribute] + "</p>";

            document.querySelector(".range").onInput = year;

            layer.on('click', function(e) {
                showPopupContent(popupContent);
            });
        };
    });
};

function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.startsWith("Vandalism_") && parseInt(attribute.split("_").pop(), 10) >= 2015) {
            attributes.push(attribute);
        }
    };

    return attributes;
};

// Function to create a legend for a map
const createLegend = (min, max) => {
    // Ensure minimum value is at least 10
    if (min < 10) {
        min = 10;
    }
    const roundNumber = (inNumber) => (Math.round(inNumber / 10) * 10);

    // Find the legend container in the HTML
    let legendContainer = document.getElementById('legend');
    legendContainer.innerHTML = ''; // Clear existing content
    let symbolsContainer = document.createElement("div");
    symbolsContainer.className = "symbolsContainer";

    // Define classes for the legend based on min, max, and midpoint values
    let classes = [roundNumber(max), roundNumber((max - min) / 2), roundNumber(min) ];

    // Add a title to the legend
    // let title = document.createElement('h2');
    // title.id = 'legendTitle';
    // title.innerHTML = 'Vandalism Counts <br> by Neighborhood';
    // legendContainer.appendChild(title);

    let overlap = 4; // This determines how much each circle overlaps the one below it

    for (let i = 0; i < classes.length; i++) {
        let currentRadius = calcPropRadius(classes[i]);
        let legendCircle = document.createElement('div');
        legendCircle.className = 'legendCircle';
        legendCircle.style.width = currentRadius * 2 + 'px';
        legendCircle.style.height = currentRadius * 2 + 'px';
        legendCircle.style.bottom = '0'; // Align the bottom edge of all circles

        // Create the legendValue and position it above the circle
        let legendValue = document.createElement('span');
        legendValue.className = 'legendValue';
        legendValue.textContent = classes[i];
        // Position the legendValue 2px above the upper edge of the legendCircle
        legendValue.style.bottom = `${currentRadius * 2 + 2}px`;

        symbolsContainer.appendChild(legendCircle);
        symbolsContainer.appendChild(legendValue); // Append the legendValue separately
    }

    // Append the symbols container to the legend container
    legendContainer.appendChild(symbolsContainer);
};



// The getData() function is responsible for fetching and displaying the GeoJSON data on the map.
// It also applies custom styling to the point features.
function getData(){
    fetch("data/crime15_23.geojson")
        .then(response => response.json())
        .then(json => {
            let attributes = processData(json);
            //calculate minimum data value
            minValue = calculateMinValue(json);

            //call function to create proportional symbols
           createPropSymbols(json, attributes);
           createSequenceControls(attributes);
        }).catch(error => console.error('Error loading GeoJSON data:', error));
};


// Ensures the map initialization happens after the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', createMap);








