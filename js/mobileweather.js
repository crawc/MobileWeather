// Written by: Jonathan Wolfe
// Date: 8/31/2015
// Current End Time
var endDate = new Date();
endDate.setUTCSeconds(0, 0);

var map = L.map('map', {
    zoom: 4,
    scrollWheelZoom: true,
    inertia: true,
    inertiaDeceleration: 2000,
    fullscreenControl: false,
    center: [38.0, -90.50],
    timeDimension: true,
    timeDimensionControl: true,
    timeDimensionControlOptions: {
        autoPlay: true,
        playerOptions: {
            buffer: 3,
            transitionTime: 500,
            loop: true
        },
        speedSlider: false
    },
    timeDimensionOptions: {
        timeInterval: "PT30M/" + endDate.toISOString(),
        period: "PT5M"
    }

});

// Basemap
var layer = L.esri.basemapLayer("NationalGeographic", {
    detectRetina: true
}).addTo(map);

// Geo-locate
map.locate({
    setView: false,
    maxZoom: 8,
    enableHighAccuracy: true
});

function onLocationFound(e) {
    L.marker(e.latlng).addTo(map);
    //L.circle(e.latlng, radius).addTo(map);
    map.setView(e.latlng, 8);
}

map.on('locationfound', onLocationFound);

function onLocationError(e) {
    console.log(e.message);
}

map.on('locationerror', onLocationError);

// Radar time-enabled WMS
var wmsUrl = "https://new.nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer";

var radarWMS = L.nonTiledLayer.wms(wmsUrl, {
    layers: '1',
    format: 'image/png',
    transparent: true,
    opacity: 0.5,
    attribution: 'nowCOAST'
});

var proxy = 'server/proxy.php';
var radarLayer = L.timeDimension.layer.wms(radarWMS, {
    proxy: proxy,
    updateTimeDimension: false,
    updateTimeDimensionMode: "replace"
});
radarLayer.addTo(map);


// State overlay
function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0
    };
}

var geojson = L.geoJson(statesData, {
    style: style
}).addTo(map);

var hazard_style = {
    style: function(feature) {
        if (feature.properties.phenomenon == "SV") {
            return {
                color: "yellow",
                fill: 0,
                opacity: 1
            };
        }
        return {
            color: feature.properties.color,
            fill: 0,
            opacity: 1
        };
    }
}

var hazard_layer = new L.geoJson(null, hazard_style);
hazard_layer.addTo(map);



$.ajax({
    dataType: "json",
    url: "server/hazards.php",
    success: function(data) {
        $(data.features).each(function(key, data) {
            hazard_layer.addData(data);
            //hazard_layer.bringToFront();
        });
    }
}).error(function() {});


map.on('drag', function(e) {
    hazard_layer.bringToFront();
    console.log('dragging');

    //geojson.bringToFront();
});

// NHC Hurricane Tracks
//var nhcTracks = L.tileLayer.wms("http://new.nowcoast.noaa.gov/arcgis/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer/WMSServer", {
//    layers: '0,1,2,3,4,5,6,7,8',
//    format: 'image/png',
//    transparent: true,
//    opacity: 0.5,
//    format: 'image/png32',
//    attribution: 'nowCOAST'
//});
//nhcTracks.addTo(map);

// var theLegend = L.control({
//     position: 'topright'
// });

// theLegend.onAdd = function(map) {
//     var src = "http://new.nowcoast.noaa.gov/images/legends/radar.png";
//     var div = L.DomUtil.create('div', 'info legend');
//     div.style.width = '270px';
//     div.style.height = '50px';
//     div.innerHTML += '<b>Legend</b><br><img src="' + src + '" alt="legend">';
//     return div;
// };
// theLegend.addTo(map);

// L.control.coordinates({
//     position: "bottomright",
//     decimals: 3,
//     labelTemplateLat: "Latitude: {y}",
//     labelTemplateLng: "Longitude: {x}",
//     useDMS: false,
//     enableUserInput: true
// }).addTo(map);

// Basemap labels
// var labels = L.esri.basemapLayer('DarkGrayLabels').addTo(map);
// labels.setZIndex(1000);
// function zoomToFeature(e) {
//     map.fitBounds(e.target.getBounds());
// }

// function onEachFeature(feature, layer) {
//     layer.on({
//         click: zoomToFeature
//     });
// }