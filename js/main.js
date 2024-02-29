
// Global variables 
let map;
let minValue;
let maxValue;
let vandalismCountsByYear = {};
let geoJson;
let rangeSlider;

// Graffiti periods
const periodDescriptions = {
    "2015-2019: <br>Pre-COVID Relative 'Stability'":
        'Between 2015 and 2019, Portland grappled with a persistent presence of graffiti. The city actively addressed it through various approaches. Funding for removal programs remained relatively consistent, prioritizing swift removal, community engagement, and preventive education initiatives. The politics surrounding graffiti management primarily resided at the local level, with the city council and community organizations holding significant influence.<br><br><b>Funding:</b> Annually, the city allocated $650,000 for graffiti removal, with additional support from private initiatives like "Keep Portland Weird." <br><br><b>Politics:</b> Debates arose about balancing artistic freedom with property rights and public safety. "Street art" gained some acceptance, while "tagging" remained largely condemned. <br><br><b>Graffiti Trends:</b> Increased reports of vandalism, particularly gang-related tagging. Community-driven mural projects emerged, fostering dialogue around positive uses of graffiti.',
    "2020: <br>Early COVID-19 Impact and Social Unrest:":
        '<br><b>Early 2020:</b> As COVID- 19 began to spread, Portland, like many cities, saw a reduction in public and economic activities due to lockdowns and social distancing measures.This period saw a temporary dip in graffiti incidents due to fewer people being outdoors. <br><br><br><b>Mid to Late 2020:</b> The economic strain and social unrest, partly fueled by the pandemic and various social movements, led to an increase in graffiti. Some of this was protest - related, while other instances were attributed to the general increase in vandalism as urban areas saw reduced foot traffic and less oversight. <br><br><br><b>Funding:</b> City redirected resources towards pandemic response, leading to a decrease in graffiti removal budget (~$450,000). <br><br><b>Politics:</b> The pandemic amplified existing social and economic inequalities, potentially contributing to increased frustration and expression through graffiti. Discussions emerged about using graffiti as a platform for social commentary on pandemic issues. <br><br><b>Graffiti Trends:</b> A mixed picture. Some reported a decline in tagging due to lockdown restrictions, while others observed a rise in protest-related graffiti addressing social justice issues and pandemic anxieties.'
    ,
    "2021: <br>Rising Graffiti Incidents Amidst COVID-19":
        '<br><b>Early to Mid 2021:</b> As the pandemic continued, Portland saw a significant uptick in graffiti. This was attributed to several factors, including the continued economic fallout, the impact of social isolation, and the utilization of graffiti as a form of protest and expression. <br><br><b>Response and Funding:</b> In response to the rise in graffiti, Portland\'s city council and local government bodies allocated additional resources for graffiti removal programs. There was a push for more community involvement and partnerships with local businesses to address the issue. However, the effectiveness of these measures was a point of political debate, with varying opinions on how to balance enforcement, support for artistic expression, and the allocation of city resources amidst the pandemic.'
    ,
    "2022: <br>Adaptive Responses and Persistent Challenges":
        '<br><b>2022:</b> The city continued to grapple with the dual challenges of managing graffiti and navigating the broader impacts of the COVID-19 pandemic. There was an emphasis on innovative solutions, such as murals and public art projects, to deter graffiti while supporting local artists. Political discussions also centered around the root causes of graffiti, including addressing social issues exacerbated by the pandemic. <br><br><br><b>Funding:</b> Graffiti removal budget remains lower than pre-pandemic levels (~$500,000). <br><br><b>Politics:</b> Debates continue about the role of graffiti in the citys identity and the balance between expression and public order. The conversation around social justice and protest art persists.<br><br><b>Graffiti Trends:</b> Reports suggest a gradual return to pre- pandemic levels of tagging, but with a continued presence of protest and community - driven mural projects.',
    "2023: <br>Stabilization and Continued Vigilance":
        '<br><b>Early 2023:</b> The focus remained on sustainable solutions to graffiti, with ongoing debates around funding priorities, the role of law enforcement, and community- led initiatives.The interplay between graffiti, COVID-19, and urban policy remained a dynamic issue, reflecting broader societal shifts and challenges. <br><br><br><b>Funding:</b> Graffiti removal budget remains lower than pre-pandemic levels (~$500,000). <br><br><b>Politics:</b> Debates continue about the role of graffiti in the citys identity and the balance between expression and public order. The conversation around social justice and protest art persists.<br><br><b>Graffiti Trends:</b> Reports suggest a gradual return to pre- pandemic levels of tagging, but with a continued presence of protest and community - driven mural projects.'
};


// Add event listeners for splash screen and sidebar panel behavior
document.addEventListener('DOMContentLoaded', function () {
    const splashScreen = document.getElementById('splash-screen');
    const closeButton = document.getElementById('close-splash');
    const toggleBtn = document.getElementById('toggle-panel-btn');
    rangeSlider = document.querySelector('.range');
    // Add event listener to close the splash screen when the close button is clicked
    closeButton.addEventListener('click', function () {
        splashScreen.style.display = 'none';
    });
    // Attach the event listener to the toggle button and fire the toggle function when the close button is clicked
    toggleBtn.addEventListener('click', toggleSidePanelAndAdjustMap);
});

// Function to toggle the side panel and adjust the map
const toggleSidePanelAndAdjustMap = () => {
    const sidePanel = document.getElementById('side-panel-container');
    const mapContainer = document.getElementById('map-container');

    // Toggle the classes to resize the map and side panel
    sidePanel.classList.toggle('closed');
    mapContainer.classList.toggle('expanded');

    // Wait for the transition, then adjust the map size and re-center
    setTimeout(function () {
        map.invalidateSize(); // Adjust map size to new container size
        // Re-center the map on Portland, Oregon
        map.setView([45.5152, -122.6784], map.getZoom());
    }, 300); // Adjust timeout duration
}

// Function to instantiate the Leaflet map
const createMap = () => {
    // Create the map and set its initial view to the specified coordinates and zoom level
    // Restrict the user's viewport to the specified coordinates and zoom levels
    map = L.map('map-container', {
        center: [0, 100], // Portland, Oregon coordinates
        zoom: 12, // Initial zoom level
        minZoom: 11, // Minimum zoom level (city view)
        maxZoom: 14, // Maximum zoom level (neighborhood view)
        maxBounds: [ // Restricts view to Portland area
            [45.4323, -122.8367], // Southwest bounds
            [45.6529, -122.4727]  // Northeast bounds
        ]
    });

    // Add a tile layer to the map using Stadia Maps' Alidade Smooth tiles for terrain visualization
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    }).addTo(map)
    // Add additional attribution t
    map.attributionControl.addAttribution('Vandalism data &copy; <a href="https://www.portland.gov/police/open-data/crime-statistics">Portland Police Bureau</a>');

    // Initiate the retrieval and display of neighborhood boundaries, once fully loaded in the DOM, call and load the addNeighborhoodPoints function, in order to ensure that addNeighborhoodPoints() is called only after the successful addition of the neighborhood boundaries layer
    addNeighborhoodBoundaries()
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

// Function to capitalize the first letter of each word
const capitalizeFirstLetter = (string) => {
    return string
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

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
    const name = capitalizeFirstLetter(feature.properties.NAME);
    const vandalisms = feature.properties[attributes[0]];
    let popupContent = "<h1>Year: " + year + "</h1><p><b>Neighborhood:</b> </br>" + name + "</p>" +
        "<p><b>Number of vandalisms:</b> </br>" + vandalisms + "</p>";

    // Attach event listener for displaying custom popup content
    layer.on('click', function (e) {
        L.DomEvent.stopPropagation(e); // Prevent event from propagating to lower layers
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
const updateSliderDisplayAndSymbols = (index, attributes) => {
    // Get the attribute name for the current index
    let key = attributes[index];
    // Extract the year part from the attribute to display in the slider
    let year = key.slice(-4);
    document.getElementById('rangeValue').textContent = `Year: ${year}`;
    // Update the proportional symbols on the map to reflect the current year
    updatePropSymbols(attributes[index]);
    // Update the total vandalism count display
    updateTotalVandalismCountDisplay(year);

    // Calculate the percentage of the slider's value relative to its total range
    const percentage = (index / (attributes.length - 1)) * 100;

    // Update the slider's background to reflect the percentage
    // Red for the 'filled' part, grey for the 'unfilled' part
    rangeSlider.style.background = `linear-gradient(to right, red ${percentage}%, grey ${percentage}%)`;

    // Determine the period based on the year
    let period;
    if (year >= 2015 && year <= 2019) {
        period = "2015-2019: <br>Pre-COVID Relative 'Stability'";
    } else if (year == 2020) {
        period = "2020: <br>Early COVID-19 Impact and Social Unrest:";
    } else if (year == 2021) {
        period = "2021: <br>Rising Graffiti Incidents Amidst COVID-19";
    } else if (year == 2022) {
        period = "2022: <br>Adaptive Responses and Persistent Challenges";
    } else {
        period = "2023: <br>Stabilization and Continued Vigilance";
    }

    // Update side panel content
    // Update side panel content
    const mapDescriptionContainer = document.getElementById('map-description');
    mapDescriptionContainer.innerHTML = `
    <h1 class="map-title">${period}</h1>
    <p>${periodDescriptions[period]}</p>`;
}


// Handle navigation through years with forward and reverse buttons.
const navigateThroughYears = (buttonId, attributes) => {
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
const initializeSlider = (attributes) => {
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

            // Add a click event listener to the layer to display the popup content in the popup container
            layer.on('click', function (e) {
                L.DomEvent.stopPropagation(e); // Prevent event from propagating to lower layers
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

// The addNeighborhoodBoundaries() function is responsible for fetching and displaying the neighborhood data for the map
const addNeighborhoodBoundaries = () => {
    return new Promise((resolve, reject) => {
        fetch("data/pdx_hoods4326.geojson")
            .then(response => response.json())
            .then(data => {
                let geoJsonLayer = L.geoJSON(data, {
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
                    position: 'topleft',
                    layer: geoJsonLayer,
                    propertyName: 'MAPLABEL',
                    initial: false,
                    zoom: 12,
                    marker: false,
                    moveToLocation: function (latlng, title, map) {
                        map.fitBounds(latlng.layer.getBounds());
                        latlng.layer.fire('click'); // Open the popup
                    },
                    filter: function (text, layer) {
                        // Convert both search text and layer property to lowercase for case-insensitive comparison
                        return layer.feature.properties.NAME.toLowerCase().indexOf(text.toLowerCase()) !== -1;
                    }
                }))
            })
            .then(function () {
                addNeighborhoodPoints();
                resolve(); // Resolve the promise after adding the layer
            })
            .catch(error => console.error('Error loading GeoJSON data:', error));
    });
};

// Make sure that the slider the default click propagation behavior on the map is disabled for th(e.g., when user clicks on slider, map won't zoom)
const slider = L.DomUtil.get('slider');
if (slider) {
    L.DomEvent.disableClickPropagation(slider);
    L.DomEvent.on(slider, 'mousewheel', L.DomEvent.stopPropagation);
}

// Ensures the map initialization happens after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', createMap);