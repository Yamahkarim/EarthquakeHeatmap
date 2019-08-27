var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var linkPlates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// API CALL
// Execute GET request to the query URL using d3
// Send the data.features object to the createFeatures function
d3.json(link, function(data) {
  d3.json(linkPlates, function(moreData) {
    createFeatures(data.features, moreData.features);
  })

});

function createFeatures(earthquakeData, tectonicPlates) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h2>Magnitude: " + feature.properties.mag + "</h2>" + "<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  };


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {  
      var geojsonMarkerOptions = {
        fillOpacity: 0.8,
        color: "black",
        weight: 1,
        fillColor: selectColor(feature.properties.mag),
        radius: feature.properties.mag * 7
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });
  // define features for outline of tectonic plates 
  var plates = L.geoJSON(tectonicPlates, {
    color: "#f56942",
    weight: 5,
    fillColor: "transparent"
  });
  // Instantiate earthquakes layer with the createMap function
  createMap(earthquakes, plates);
}
// Define color scale with a function
function selectColor(bubble) {
    if (bubble > 5) {
      color = "#bd0026";
    }
    else if (bubble > 4) {
      color = "#f03b20"
    }
    else if (bubble > 3) {
      color = "#fd8d3c"
    }
    else if (bubble > 2) {
      color = "#ffffb2"
    }
    else if (bubble > 1) {
      color = "#c2e699"
    }
    else if (bubble < 1) {
      color = "#78c679"
    }
    else {
      color = "#238443"
    }
    return color;
  }

function createMap(earthquakes, plates) {

  // Define Map layers for Street Map, Topographic Map, Satelite Map, Dark Map
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.dark",
    accessToken: API_KEY
  }); 

  var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 20,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


  // Define a baseMaps object to hold the base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Topographic Map": OpenTopoMap,
    "Satellite Map": satmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold the overlay layer
  var overlayMaps = {
    Plates: plates,
    Earthquakes: earthquakes 
  };

  // Create the map, giving it the Topographic Map and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, plates, earthquakes,OpenTopoMap]
  });

  var legend = L.control({position: "bottomright"});
  legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 1, 2, 3, 4, 5],
      labels = [];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + selectColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);
  // Create a layer control
  // Pass in the baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
} 

//ADD scale bar for better readability 
// addScaleBar(myMap, position = c( "bottomleft"), options = scaleBarOptions());

// scaleBarOptions(maxWidth = 100, metric = TRUE, imperial = TRUE,
//   updateWhenIdle = TRUE);

// removeScaleBar(myMap);
L.control.scale().addTo(map);