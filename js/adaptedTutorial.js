// The following code is adapted from the Leaflet Geojson Tutorial by Leaflet.js (https://leafletjs.com/examples/geojson/)

// Initialize the map to North America using Stadia terrain base map tiles
var map = L.map('map').setView([41.5260, -105.2551], 4);
// Add a tile layer to the map using stadia terrain base map tiles
L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
}).addTo(map)

// Examples of using geojson lines and polygons in Leaflet

// Example of creating an array of geojson objects
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

// Example of style object
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};
// Set the geojson style by passing in the myStyle object
L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

// Create a states geojson variable with political party properties to explore passing a
// function to the style property to style features differently based on their properties
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];
// Use an anonymous function to dynamically change the style of the geojson features based on their properties
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);


// Examples of handling points in Leaflet
// Example of adding a simple point geojson feature layer
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

// Create the  GeoJSON layer and add it to the map
L.geoJSON(geojsonFeature).addTo(map);


// Additional example of handling points in Leaflet, which are handled differently in Leaflet since, by default,
// they are drawn as simple markers. To alter this behavior, use the pointToLayer() when creating the GeoJson layer

// Create a geojson styls option object
var geojsonMarkerOptions = {
    radius: 10,
    fillColor: "#ff7800",
    color: "#ffffff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var sportsRivalsGeoJSON = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "University of Wisconsin-Madison",
                "category": "University",
                "team": "Badgers",
                "popupContent": "Go Badgers!",
                "visible": true,
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-89.406749, 43.076592] // Longitude, Latitude
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "University of Michigan",
                "category": "University",
                "team": "Wolverines",
                "popupContent": "Meh, Wolverines.",
                "visible": false
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-83.738224, 42.278044] // Longitude, Latitude
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Ohio State University",
                "category": "University",
                "team": "Buckeyes",
                "visible": false,
                "popupContent": "Meh, Buckeyes.",
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-83.030914, 40.006836] // Longitude, Latitude
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "University of Minnesota",
                "category": "University",
                "team": "Golden Gophers",
                "visible": false,
                "popupContent": "Meh, Golden Gophers. I mean, if you were the Golden Girls I would cheer.",
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-93.227728, 44.97399] // Longitude, Latitude
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Portland, Oregon",
                "category": "City",
                "visible": true,
                "popupContent": "Goooo Timbers!",
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-122.6765, 45.5231] // Portland, Oregon
            }
        }
    ]
};

// Define the onEachFeature() function to bind a popup to each feature when clicked.
function onEachFeature(feature, layer) {
    // If the feature has a property called "popupContent" bind a popup to the layer
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

// Use the pointToLayer function to pass in the geoJSON style options, onEachFeature to attach a popup,
// and the filter function to control visibility of certain features
L.geoJSON(sportsRivalsGeoJSON, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    onEachFeature: onEachFeature,
    filter: function(feature, layer) {
        return feature.properties.visible;
    }
}).addTo(map);

// ========================================================================
// Module 1; Lesson 2
// ========================================================================

// CODE COPIED DIRECTLY FROM MODULE 1 LESSON 2
/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();
};

function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map - includes custom point styling and uses pointToLayer method in tandem with OnEachFeature method methods
function getData(){
    //load the data
    fetch("data/MegaCities.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create marker options
            var geojsonMarkerOptions = {
             radius: 8,
             fillColor: "#ff7800",
             color: "#000",
             weight: 1,
             opacity: 1,
             fillOpacity: 0.8
            };
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                pointToLayer: function (feature, latlng){
                    console.log('hello?')
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
                onEachFeature: onEachFeature
            }).addTo(map);
        });

};

document.addEventListener('DOMContentLoaded',getData)