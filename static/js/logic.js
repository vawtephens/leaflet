//Brad Vawter

  ///declare gloval variables
  var geoDataSig;
  var geojson;
  var lat = []  //geometry.coordinates[1]
  var lon = []  //geometry.coordinates[0]
  var mkGrp = []
  ///variables to determine average lat and lon so map can be centered
  var lat_avg = 0.0
  var lat_sum = 0
  var lon_avg = 0.0
  var lon_sum = 0.0
  var map = null

// Select the button
var but = d3.select("#gen-chart");
var catS = d3.select("#cat")

//create event handler
             //NEED to update DT
but.on("click", buildURL);

//function to add elements to drop down
function dd(cat,arr) {
    var c = d3.select(cat)
    arr.forEach((x) => {
    c.append("option").text(x)
    });
}

//Values for Drop Downs
var times = ["Past 7 Days","Past Day","Past Hour"]
var cats = ["M4.5+ Earthquakes","M2.5+ Earthquakes","M1.0+ Earthquakes","All Earthquakes"]

//Load Values in Drop Downs
dd("#time",times);
dd("#cat",cats); 



function buildURL() {
    var cat
    var time
    //Obtain var for id datetime
        var formCat = d3.select("#cat").property("value");
        
        var formTime = d3.select("#time").property("value");

        switch (true) {
            case formCat == "Significant Earthquakes":
                cat = "significant_";
                break;        
            case formCat == "M4.5+ Earthquakes":
                cat = "4.5_";
                break;
            case formCat == "M2.5+ Earthquakes":
                cat = "2.5_";
                break;
            case formCat == "M1.0+ Earthquakes":
                cat = "1.0_";
                break;
            case formCat == "All Earthquakes":
                cat = "1.0_";
                break;
            default:
                cat = "significant_"                           }
                        
        switch (true) {
            case formTime == "Past 30 Days":
                time = "month" 
                break;
            case formTime == "Past 7 Days":
                time = "week" 
                break;
            case formTime == "Past Day":
                time = "day" 
                break;         
            case formTime == "Past Hour":
                time = "hour" 
                break;
            default:
                time = "month"
        };
    
    geoDataSig = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/" + cat + time + ".geojson"
    getData()
    }
  function getData() {
    d3.json(geoDataSig, function(data) {
        //drill to features
        data2 = data.features
        //define marker group as = emtpy array
        mkGrp = []
        data2.forEach(x => {
            lat.push(x.geometry.coordinates[1]);
            lon.push(x.geometry.coordinates[0]);
          //  mag.push(x.properties.mag);
            lat_sum +=  x.geometry.coordinates[1];

            lon_sum +=  x.geometry.coordinates[0];
            //console.log(new Date(x.properties.time))
            mkGrp.push(L.circle([x.geometry.coordinates[1],x.geometry.coordinates[0]], {
                stroke: false,
                fillOpacity: 0.6,
                color:"white",
                fillColor: magCol(x.properties.mag),
                radius: x.properties.mag*30000

            }).bindPopup(x.properties.title + 
                "<hr> Date:  " + new Date(x.properties.time) +
                "<hr> Tsunami Warning: " + tsu(x.properties.tsunami))
            ); //end of marker group
            
        });//end of data for each
        ///calculate average lat and lon for calcuations
        lat_avg = lat_sum/lat.length
        lon_avg = lon_sum/lon.length
      
        
        //create layer group
        var sigMon = L.layerGroup(mkGrp);
        

        //remove map layer if present 
        try {
            map.off();
            map.remove();
    
    
    } catch (error) {console.log("First Map Load")}
        //try {

                // Create base layer
                var base = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
                    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
                    maxZoom: 18,
                    id: "mapbox/streets-v11",
                    accessToken: API_KEY
                });
                
                //define map object
                map = L.map("map", {
                    center: [lat_avg, lon_avg],
                    zoom: 2,
                    layers: [base, sigMon]
                });

        ///Legend setup  (legend help from https://www.igismap.com/legend-in-leafletjs-map-with-topojson/)
        var legend = L.control({position: 'topleft'});
        legend.onAdd = function (map) { 
        var div = L.DomUtil.create('div', 'info legend'),
        grades = [0,1,2,3,4,5,6];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += '<i style="background:' + magCol(grades[i] + 1) + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }
            return div;
            };
        legend.addTo(map);
    
    var quakes = d3.select("#quakes")
            quakes.text(`${mkGrp.length} Earthquakes Displayed`)


    })//// End of d3 json

};
// fuction to set color of dot or legend
function magCol(z) {
    switch (true) {
        case z <= 1:
            return "rgb(255,255,0)"
        case z <= 2:
            return "rgb(204,255,51)"
        case z <= 3:
            return "rgb(255,153,153)"
        case z <= 4:
            //return "rgb(204,51,153)"
            return "rgb(132,151,176)"
        case z <= 5:
            return "rgb(84,150,53)"
        case z <= 6:
            //return "rgb(132,151,176)"
            return "rgb(204,51,153)"
        default:
            return "rgb(255,0,0)"
    };////end of switch for mag
};///end of function magCol

//function to determine if tsunami warning
function tsu(z) {
    switch (z) {
        case 0:
            return "No"
        case 1:
            return "Yes"
        default:
            return "unknown"
    }
}

///build url on initial load
buildURL()
