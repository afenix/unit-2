
// Declare global variables for the map and min/max values
let map;
let minValue;
let maxValue;
let vandalismCountsByYear = {};
let geoJson;

// Add event listener to open the splash screen when the page is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    var splashScreen = document.getElementById('splash-screen');
    var closeButton = document.getElementById('close-splash');
    // Add event listener to close the splash screen when the close button is clicked
    closeButton.addEventListener('click', function () {
        splashScreen.style.display = 'none';
    });
});

// Function to instantiate the Leaflet map
const createMap = () => {
    // Create the map and set its initial view to the specified coordinates and zoom level
    map = L.map('map-container').setView([45.53109574953526, -122.63896226979082], 12);

    // Add a tile layer to the map using Stadia Maps' Alidade Smooth tiles for terrain visualization
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    }).addTo(map)
    // Add additional attribution t
    map.attributionControl.addAttribution('Vandalism data &copy; <a href="https://www.portland.gov/police/open-data/crime-statistics">Portland Police Bureau</a>');

    // Initiate the retrieval and display for summarized crime data by neighborhood polygon by calling the getHoodData function
    addNeighborhoodBoundaries();
    // Initiate the retrieval and display for summarized crime data by neighborhood centroids by calling the addNeighborhoodPoints function
    addNeighborhoodPoints();
};
// Determine the min and max values for all years of data in order to scale legend
// proportional symbols to match map.
const calcMinMaxValue = (data) => {
    let allValues = [];
    for (let crime of data.features) {
        for (let year = 2015; year <= 2023; year++) {
            let value = crime.properties["Vandalism_" + String(year)];

            if (value) { // Check if value exists before pushing
                allValues.push(value);
            }
        }
    }
    let minValue = Math.min(...allValues);
    let maxValue = Math.max(...allValues);

    return { minValue, maxValue };
}

// Calculate the radius of each proportional symbol
const calcPropRadius = (attValue) => {
    // Define a minimum radius for the symbol, to ensure it's always visible
    const minRadius = 1;

    // Calculate the radius of the symbol using the Flannery Appearance Compensation formula
    // This formula is used to adjust the size of the symbol proportionally based on the attribute value
    const radius = 1.0083 * Math.pow(attValue / minValue, 0.5715) * minRadius;

    return radius;
};

// Function to create a circle marker with popup content for each point feature in the data
const pointToLayer = (feature, latlng, attributes) => {
    // Assign the current attribute based on the first index of the attributes array
    const attribute = attributes[0];
    // Get the count of the vandalism by point and make sure it's a number
    const attValue = Number(feature.properties[attribute]);

    // Calculate the radius of the circle marker based on the attribute value
    const radius = calcPropRadius(attValue);

    // Create the circleMarker
    let layer = L.circleMarker(latlng, {
        radius: radius,
        fillColor: "#ff7800",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    });

    // Construct popup content
    const year = attributes[0].split("_")[1];
    const name = feature.properties.NAME;
    const vandalisms = feature.properties[attributes[0]];
    let popupContent = "<h1>Year: " + year + "</h1><p><b>Neighborhood:</b> </br>" + name + "</p>" +
        "<p><b>Number of vandalisms:</b> </br>" + vandalisms + "</p>";

    // Attach event listener for displaying custom popup content
    layer.on('click', function (e) {
        showPopupContent(popupContent);
    });

    return layer;
}

// Function to create proportional symbols for features in the data
const createPropSymbols = (data, attributes) => {
    // Create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        // For each feature, create a point using the provided attributes
        pointToLayer: (feature, latlng) => pointToLayer(feature, latlng, attributes)
    }).addTo(map);
};

const createSequenceControls = (attributes) => {
    // Attach input event listener to the range slider to update the map symbols and displayed year.
    document.querySelector('.range').addEventListener('input', function () {
        updateSliderDisplayAndSymbols(this.value, attributes);
        // Hide the popup-content when the slider value changes
        document.getElementById('popup-content').style.display = 'none';
    });

    // Attach click event listeners to forward and reverse buttons to navigate through the years.
    document.querySelectorAll('.button').forEach(button => {
        button.addEventListener("click", function () {
            navigateThroughYears(button.id, attributes);
            // Hide the popup-content when the slider value due to a click event on the buttons
            document.getElementById('popup-content').style.display = 'none';
        });
    });
};

// Update the display and map symbols based on the slider value.
function updateSliderDisplayAndSymbols(index, attributes) {
    let key = attributes[index];
    let year = key.slice(-4); // Extract the year part from the attribute.
    document.getElementById('rangeValue').textContent = `Year: ${year}`;
    // Update the proportional symbols on the map to reflect the current year
    updatePropSymbols(attributes[index]);
    // Update the total vandalism count display
    updateTotalVandalismCountDisplay(year);
}


// Handle navigation through years with forward and reverse buttons.
function navigateThroughYears(buttonId, attributes) {
    let slider = document.querySelector('.range');
    let index = parseInt(slider.value, 10);
    if (buttonId === 'forward') {
        index = Math.min(index + 1, attributes.length - 1);
    } else if (buttonId === 'reverse') {
        index = Math.max(index - 1, 0);
    }

    slider.value = index;
    updateSliderDisplayAndSymbols(index, attributes);
}

// Initialize the slider with the first year (assumed to be 2015) on page load.
function initializeSlider(attributes) {
    let initialIndex = attributes.findIndex(attribute => attribute.endsWith('2015'));
    let slider = document.querySelector('.range');
    if (initialIndex !== -1) {
        slider.value = initialIndex;
        updateSliderDisplayAndSymbols(initialIndex, attributes);
    } else {
        console.error('Year 2015 not found in attributes.');
    }
}

// Function to update the size of the proportional symbols on the map and the content of their associated popups
const updatePropSymbols = (attribute) => {
    // Iterate over each layer on the map
    map.eachLayer((layer) => {
        // Check if the layer has a feature and if that feature has a property that matches the attribute
        if (layer.feature && layer.feature.properties[attribute]) {
            // Access the properties of the feature
            const props = layer.feature.properties;

            // Calculate a new radius for the layer's symbol based on the value of the feature's attribute
            const radius = calcPropRadius(props[attribute]);
            // Update the layer's radius
            layer.setRadius(radius);

            // Construct HTML to be used as the content of the layer's popup
            const year = attribute.split("_")[1];
            let popupContent = "<h1>Year: " + year + "</h1>" + "<p><b>Neighborhood:</b> </br>" + props.NAME + "</p>";
            popupContent += "<p><b>Number of vandalisms:</b> </br>" + props[attribute] + "</p>";

            // Add a click event listener to the layer to display the popup content in the side-panel-container
            layer.on('click', function (e) {
                showPopupContent(popupContent);
            });
        };
    });
};

// Function to process GeoJSON data and extract relevant column names
const processData = (data) => {
    // Initialize an array to store column names that meet our criteria
    let columnNames = [];

    // Extract properties from the first feature in the GeoJSON data
    let properties = data.features[0].properties;

    // Iterate over each property (column) in the properties object
    for (let column in properties) {
        // Check if the column name starts with "Vandalism_" and the year (last part of the column name) is 2015 or later
        // This is done to filter out columns that don't represent vandalism data or represent data from before 2015
        if (column.startsWith("Vandalism_") && parseInt(column.split("_").pop(), 10) >= 2015) {
            // If the column passes the check, add its name to the columnNames array
            columnNames.push(column);
        }
    };
    return columnNames;
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
    symbolsContainer.className = "symbols-container";

    // Define classes for the legend based on min, max, and midpoint values
    let classes = [roundNumber(max), roundNumber((max - min) / 2), roundNumber(min)];

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
        legendValue.textContent = classes[i].toLocaleString();
        // Position the legendValue 2px above the upper edge of the legendCircle
        legendValue.style.bottom = `${currentRadius * 2 + 2}px`;

        symbolsContainer.appendChild(legendCircle);
        symbolsContainer.appendChild(legendValue); // Append the legendValue separately
    }

    // Append the symbols container to the legend container
    legendContainer.appendChild(symbolsContainer);
};



// Function to display popup content in the side-panel-container to the left of the map.
const showPopupContent = (content) => {
    const popupContent = document.getElementById('popup-content');
    popupContent.innerHTML = content;
    popupContent.style.display = 'block'; // Show the content
}

// Function to hide the popup content when not needed
const hidePopupContent = () => {
    const popupContent = document.getElementById('popup-content');
    popupContent.style.display = 'none'; // Hide the content
}

// Function to update the total vandalism count display
const updateTotalVandalismCountDisplay = (year) => {
    const totalCountElement = document.getElementById('total-count');
    const selectedYearElement = document.getElementById('selected-year');
    selectedYearElement.textContent = year;
    totalCountElement.textContent = vandalismCountsByYear[year].toLocaleString() || '0';
};

// Function to summarize the total vandalism counts by year for display
const sumYearCounts = (data) => {
    // Initialize an object to hold our year sums.
    const vandalismCountsByYear = {};

    // Iterate over each feature in the GeoJSON data.
    data.features.forEach(feature => {
        // Go through each property of the feature.
        for (const key in feature.properties) {
            // Check if the property key starts with "Vandalism_" and is followed by a year between 2015 and 2023.
            if (/Vandalism_20(1[5-9]|2[0-3])$/.test(key)) {
                // Extract the year from the key.
                const year = key.split('_')[1];
                // If the year doesn't exist in our object, initialize it with 0.
                if (!vandalismCountsByYear[year]) {
                    vandalismCountsByYear[year] = 0;
                }
                // Add the count for this feature to the total for the year.
                vandalismCountsByYear[year] += feature.properties[key];
            }
        }
    });
    // Return the accumulated counts.
    return vandalismCountsByYear;
}

// The addNeighborhoodPoints() function is responsible for fetching and displaying the GeoJSON data on the map.
// It also applies custom styling to the point features.
const addNeighborhoodPoints = () => {
    // Fetch GeoJSON data from the specified local directory
    fetch("data/crime15_23.geojson")
        .then(response => response.json())
        .then(json => {

            // Get full year count
            vandalismCountsByYear = sumYearCounts(json);

            // Initialize the display with the count for the first year in the slider (assuming it's 2015)
            updateTotalVandalismCountDisplay('2015');

            // Create a temporary Leaflet GeoJSON layer to calculate the geographical bounds of the data
            let vandalLayer = L.geoJSON(json);
            // Adjust the map view to fit the geographical bounds of the GeoJSON data
            map.fitBounds(vandalLayer.getBounds());

            // Process the GeoJSON data to extract column names
            let columnNames = processData(json);

            // Create sequence controls (e.g., sliders, buttons) based on the extracted column names
            createSequenceControls(columnNames);

            // Ensure the slider displays the year 2015 upon page load.
            initializeSlider(columnNames);

            // Calculate the minimum and maximum values in the data
            // and assign them to minValue and maxValue variables using destructuring
            ({ minValue, maxValue } = calcMinMaxValue(json));

            // Create proportional symbols based on the GeoJSON data and the extracted column names
            createPropSymbols(json, columnNames);

            // Create a legend for the map based on the minimum and maximum values
            createLegend(minValue, maxValue);
        })
        // Log an error message if there was an error loading the GeoJSON data
        .catch(error => console.error('Error loading GeoJSON data:', error));
};

// The addNeighborhoodBoundaries() function is responsible for fetching and displaying the neighborhood data for the map.
const addNeighborhoodBoundaries = () => {
    fetch("data/pdx_hoods4326.geojson")
        .then(response => response.json())
        .then(data => {
            const geoJsonLayer = L.geoJSON(data, {
                style: {
                    color: "#ff7800",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.1,
                    fillColor: "#87CEFA"
                },
                onEachFeature: (feature, layer) => {
                    if (feature.properties && feature.properties.NAME) {
                        layer.bindPopup(feature.properties.NAME);
                    }
                }
            }).addTo(map);

            // Now, set up the search feature
            map.addControl(new L.Control.Search({
                position: 'topright',
                layer: geoJsonLayer,
                propertyName: 'NAME', // This should match the property you want to search for
                initial: false,
                zoom: 12,
                marker: false,
                moveToLocation: function (latlng, title, map) {
                    // Function to execute when a search result is selected
                    map.fitBounds(latlng.layer.getBounds());
                    latlng.layer.fire('click'); // Open the popup
                }
            }));

        })
        .catch(error => console.error('Error loading GeoJSON data:', error));
};

// Make sure that the slider the default click propagation behavior on the map is disabled for th(e.g., when user clicks on slider, map won't zoom)
const slider = L.DomUtil.get('slider');
if (slider) {
    L.DomEvent.disableClickPropagation(slider);
    L.DomEvent.on(slider, 'mousewheel', L.DomEvent.stopPropagation);
}

// TODO: Improve the following so that the map is reloaded when the side-panel-container is closed
document.addEventListener("DOMContentLoaded", function () {
    var toggleBtn = document.getElementById('toggle-panel-btn');
    var sidePanel = document.getElementById('side-panel-container');
    var mapContainer = document.getElementById('map-container');

    toggleBtn.addEventListener('click', function () {
        sidePanel.classList.toggle('closed');
        mapContainer.classList.toggle('expanded'); // Toggle the class to resize the map
    });
});

// Ensures the map initialization happens after the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', createMap);