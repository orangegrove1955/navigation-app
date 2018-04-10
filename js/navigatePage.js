'use strict';
// =========================================================
//
// ENG1003 S2 2017 Assignment 2 Walking Navigation app
// navigatePage.js
//
// Team: 78
// Authors: Matthew Williams, Paul Papadopoulous, Viseshta 
// Chandra, Teresa Li
//
// This file creates a map displaying a path and the user's
// location. The map directs the user along the path with
// directions and arrows, as well as giving a distance 
// and estimated time of arrival.
//
// =========================================================

/*
=====================================================================
LOAD PATH
Section contains functions to load path from local storage
=====================================================================    
*/

// Initialise global Path object as null
var path = new Path(null, null, null);

/*
function initPath()
Downloads path from local storage and initialises from PDO into Path object, then
uses path object to change the title bar of the page

preconditions: Local storage must be available, path must be present in local storage
postconditions: Path object is created, title bar of page is updated
*/
function initPath(){
    // Check if local storage is available 
    if (storageAvailable){ 
        // Load path selected on home page from local storage 
        var pathIndex = localStorage.getItem(APP_PREFIX + "-selectedPath"); 
        if (pathIndex !== null){ 
            // Populate path from loaded value at pathIndex from local storage and 
            // set header bar title 
            var pathPDO = localStorage.getItem(APP_PREFIX + "-path" + pathIndex);
            path.initialiseFromPDO(pathPDO);
            document.getElementById("headerBarTitle").textContent = path.getTitle(); 
        }
    }
}

/*
=====================================================================
WAYPOINTS
Section contains functions that perform actions on waypoints
=====================================================================    
*/
// Begin waypoints at initial index of 0 on page load
var currentIndex = 0;

/*
function checkRoute()
Determines if a user is close enough to a waypoint to move to the next
point in the path, based on their GPS accuracy and distance from the waypoint
Displays distance from the waypoint to navigate.html, and updates page
to display a congratulatory message if the user has reached the end of the path

postconditions: Outputs distance to next checkpoint to navigate.html, and 
    displays congratulatory message if user reaches the end of the path
*/
function checkRoute(){
    
    // Convert locations into LatLng objects
    var currentWaypoint = path.getLocations(currentIndex);
    
    // Calculate the distance between user's location and the current waypoint
    var distance = google.maps.geometry.spherical.computeDistanceBetween(userLocation, currentWaypoint);
    
    // Calculate bearing between user location and current waypoint    
    var bearing = google.maps.geometry.spherical.computeHeading(userLocation, currentWaypoint);
    
    directionToWayPoint(bearing);
    
    // If the distance to the waypoint is less than the accuracy, move to next waypoint
    if (distance < accuracy){
        // If last waypoint, display end message
        if(currentIndex === path.getLocations().length-1){
            displayMessage("Congratulations, you have reached the end of the path!", 5000);
            document.getElementById("details").innerHTML = "<h3>That's the end!</h3></br><h4>Press the arrow in the top left to select a new path</h4>"
            return;
        }
        currentIndex += 1;
        // Show next part of path
        showPath(currentIndex);
    }
    // Output distance to navigate.html
    document.getElementById("distance").innerText = Math.round(distance) + " metres";
}

/*
function calculateRemainingDistance()
Calculates the value of the total distance remaining to reach the 
final waypoint of a path in metres

returns: Integer with remaining metres of path
*/
function calculateRemainingDistance(){
    var remainingPoints = path.getLocations().slice(currentIndex);
    var remainingLength = google.maps.geometry.spherical.computeLength(remainingPoints);
    remainingLength += google.maps.geometry.spherical.computeDistanceBetween(userLocation, path.getLocations(currentIndex));
    return remainingLength;
}

/*
function showRemainingDistance()
Outputs to navigate.html the value of the total distance remaining to reach the 
final waypoint of a path in metres

postconditions: Outputs string to navigate.html with remaining metres of path
*/
function showRemainingDistance(){
    var remainingLength = calculateRemainingDistance();
    document.getElementById("remaining").innerText = Math.round(remainingLength) + " metres";
}

/*
function calculateDistanceWalked()
Calcualtes the value of the total distance walked by the user in metres

returns: Integer with distance user has walked
*/
function calculateDistanceWalked(){
    var walkedLength = google.maps.geometry.spherical.computeLength(locationHistory);
    return walkedLength;
}

/*
function showDistanceWalked()
Outputs to navigate.html the value of the total distance walked by the user
in metres

postconditions: Outputs string to navigate.html with distance user has walked
*/
function showDistanceWalked(){
    var walked = calculateDistanceWalked();
    document.getElementById("walked").innerText = Math.round(walked) + " metres";
}

/*
function calculateSpeed()
Calculates the speed of the user in metres/second

returns: Integer with user's speed
*/
function calculateSpeed(){
    var walked = calculateDistanceWalked();
    var time = Date.now() - startTime;
    var speed = walked/time;
    return speed;
}

/*
function showSpeed()
Outputs to navigate.html the speed of the user in metres/second

postconditions: Outputs string to navigate.html with user's speed
*/
function showSpeed(){
    var speed = calculateSpeed();
    document.getElementById("speed").innerText = speed.toFixed(3) + " m/s";
}

/*
function calculateETA()
Calculates the estimated time remaining to reach the end of the path based
on the average speed of the user when they are moving. If the map has just loaded,
a default walking pace of 4km/h is used to estimate the time

posconditions: Outputs estimated time to navigate.html in minutes and seconds
*/
function calculateETA(){
    // Use remaining distance and speed functions to determine ETA
    var remaining = calculateRemainingDistance();
    var speed = calculateSpeed();
    var eta = null;
    
    // If the user is barely moving (such as on load), give estimated result 
    // based on human's average walking speed of approx 4km/h
    if (speed < 0.3){
        eta = remaining/1.4;
    }
    else{
        eta = remaining/speed;
    }
    
    // Convert to minutes and seconds
    var mins = Math.floor(eta / 60);
    var secs = Math.floor(eta % 60);
    
    // Output to navigate.html
    document.getElementById("eta").innerText = mins + " mins " + secs + " secs";
}

// Set up variable for line for user to follow to reach next point
var lineToFollow = null;
/*
function directionToWayPoint(bearing)
Calculates the angle between the user's heading and the bearing to the
next waypoint, then displays this information both graphically and textually
on navigate.html

argument: bearing: Angle in degrees to the next waypoint

postconditions: Outputs direction to next waypoint to navigate.html as both text
    and an image

*/
function directionToWayPoint(bearing){
    var arrow = document.getElementById("arrow");
    var output = document.getElementById("direction");
    
    // Convert to range 0-360
    bearing = (bearing +360)%360;
    // Calculate direction between bearing to waypoint and user's current heading
    var directionToPoint = bearing-heading;
    
    // If direction becomes negative, convert to positive
    if (directionToPoint < 0){
        directionToPoint += 360;
    }
    
    // Display arrow and direction depending on angle between bearing and heading
    if ((directionToPoint <= 360 && directionToPoint >= 337.5) || (directionToPoint >=0 && directionToPoint <= 22.5)){
        arrow.src = "images/straight.svg";
        output.innerHTML = "Straight";
    }
    else if (directionToPoint > 22.5 && directionToPoint <= 67.5){
        arrow.src = "images/slight_right.svg";
        output.innerHTML = "Slight right";
    }
    else if (directionToPoint > 67.5 && directionToPoint <= 112.5){
        arrow.src = "images/right.svg";
        output.innerHTML = "Turn right";
    }
    else if (directionToPoint > 112.5 && directionToPoint <= 247.5){
        arrow.src = "images/uturn.svg";
        output.innerHTML = "U-turn";
    }
    else if (directionToPoint > 247.5 && directionToPoint <= 292.5){
        arrow.src = "images/left.svg";
        output.innerHTML = "Turn left";
    }
    else if (directionToPoint > 292.5 && directionToPoint < 337.5){
        arrow.src = "images/slight_left.svg";
        output.innerHTML = "Slight left";
    }
    
    // Draw line for user to follow to reach next waypoint
    var followPath = [path.getLocations(currentIndex), userLocation];
    if (lineToFollow){
        lineToFollow.setMap(null);
    }
    lineToFollow = new google.maps.Polyline({
                path: followPath,
                map: map,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
}

/*
=====================================================================
GEOLOCATION
Section contains functions for finding user's geographical location
=====================================================================    
*/

// Variable to store the user's current location as a Google Maps Latlng object
var userLocation = undefined;

// Array to store location history
var locationHistory = [];

// Variable to store accuracy of GPS results
var accuracy = undefined;

// Variable to store user's heading
var heading = undefined;

// Variable to store the time navigation began
var startTime = null;

/*
geoFind()
Alerts the user that their location is not yet reliable and
initialises the watching of a user's geolocation. This function
will begin the app's GPS location services with callbacks to
either geoSuccess or geoError based on the position being watched
    
postconditions:
    Begins watching user position, with callbacks to either
    geoSuccess or geoError as position changes
*/
function geoFind(){
    // Alert the user and begin watching geolocation
    alert("Finding location, map will show once found");
    
    // Enable high accuracy GPS results
    var options = {
        enableHighAccuracy: true
    };
    var watchID = navigator.geolocation.watchPosition(geoSuccess, geoError, options);
}

/*
geoSuccess(position)
Stores latitude and longitude into userLocation based on the coordinates
received from the geolocation watchPosition. The function takes an
argument of position which contains the coordinates, and continuously
updates the location of the user since the position is being watched.
On the first call of this function, the user will be notified their
position has been found, and subsequent calls will be run in the background
without notifying the user. The function then calls updateLocationDistances
and updateDisplay to continuously update the app when the user moves.

argument: position: position from geolocation that contains coordinates of the user

preconditions:
    the user's location must have been successfully found
    
postconditions:
    the user's latitude and longitude will be stored in userLocation
    updateLocationDistances and updateDisplay will run
*/
function geoSuccess(position){
    // Variable to store latitude and longitude values from geolocation API
    var location = {lat: position.coords.latitude, lng: position.coords.longitude};

    accuracy = position.coords.accuracy;
    
    // If first update, alert user results are found, set start time
    // and zoom map
    if (userLocation === undefined){
        userLocation = new google.maps.LatLng(location);
        locationHistory.push(userLocation);
        startTime = Date.now();
        showPath(0);
        displayMessage("Location and distances found", 3000);
    }
    
    // Otherwise, update in background
    else{
        userLocation = new google.maps.LatLng(location);
        locationHistory.push(userLocation);
    }
    
    // Draw items onto the map at user's location
    drawItems();
    
    // Output text and image data to page
    displayInfo();
}

/*
geoError(err)
Error function for when user location can't be found, or
geolocation API returns an error

argument: err: error from watchPosition

preconditions:
    a geolocation must be attempted to be found
    
postconditions:
    the user will receive an alert to the geolocation error,
    user's position and line to follow will be removed from 
    the map
*/
function geoError(err){
    alert("No position available");
    marker.setMap(null);
    circle.setMap(null);
    lineToFollow.setMap(null);
}

/*
=====================================================================
COMPASS
Section contains functions for finding user's heading
=====================================================================    
*/

/*
Check if deviceOrientationEvent exists and add listeners for
deviceOrientationUpdate and compassNeedsCalibrationEvent
*/
if (window.DeviceOrientationEvent){
        window.addEventListener('deviceorientation', deviceOrientationUpdate);
        window.addEventListener('compassneedscalibration', compassNeedsCalibrationEvent);
    }
/*
If no deviceOrientationEvent, call GPSHeading() once a second to
update the user's heading
*/
else{
    var GPSHeadingTimer = setInterval(GPSHeading(), 1000);
}

/*
deviceOrientationUpdate(e)
This function uses the sensors of a device to find the orientation of it
via a deviceOrientationEvent. This orientation is stored in the value of
heading

argument: e: deviceOrientationEvent to get values from

preconditions: 
    a deviceOrientationEvent must exist and be reported
    the device must have a sensor capable of returning values for the event
    
postconditions:
    the value of heading will be updated
*/
function deviceOrientationUpdate(e){
    
    // Check if absolute value is true
    if (e.absolute){
            // Check that alpha value is not being given as undefined
            if (e.alpha !== undefined){
                heading = 360 - e.alpha;
            }
        }
    
    // If using iOS, use webkit for compass heading
    else if (e.webkitCompassHeading != undefined){
                heading = e.webkitCompassHeading;
            }
}
    
/*
compassNeedsCalibrationEvent()
This function alerts the user that their compass is in need of 
calibration. It produces a toast message for 5 seconds to do so

preconditions: 
    a deviceOrientationEvent must exist and be reported

postconditions:
    a toast message will be displayed for 5 seconds
*/
function compassNeedsCalibrationEvent(){
    displayMessage("Compass needs calibration. Move your phone in a figure-eight pattern.", 5000);
}

/*
GPSHeading()
Using the geolocation coordinates, calculate the heading of the user
from their two most recent positions via Google Maps Spherical API

preconditions:
    there must be two locations in the user's history to calculate heading correctly
    
postconditions:
    calculates the bearing a user is facing and stores it in heading
*/
function GPSHeading(){
    var previousLocation = locationHistory[locationHistory.length-1];
    var previousLocation2 = locationHistory[locationHistory.length-2];
    heading = new google.maps.geometry.spherical.computeHeading(previousLocation, previousLocation2);
}

/*
=====================================================================
GOOGLE MAPS
Section contains functions that interact with Google Maps
=====================================================================    
*/
// Create global variables for the map, circle, marker and path to be shown
var map = null;
var circle = null;
var marker = null;
var pathToShow = null;

/*
initMap()
Map Initialisation callback, called when Maps API loads

postconditions: Initialises map, Path object, and begins 
    position watching
*/
function initMap() 
{
    // Initialise map
    map = new google.maps.Map(document.getElementById("map"), {
    });
    
    // Initialise path
    initPath();
    
    // Begin finding geographical location
    geoFind();
}

/*
function drawMarker()
Draws Marker on the map at user's current position pointing the direction
the user is facing

preconditions: map must exist

postconditions: an arrow is drawn on the map in the direction 
    of the user's heading
*/
function drawMarker(){
    // Remove any previous markers
    if (marker !== null){
        marker.setMap(null);
    }
        marker = new google.maps.Marker({
            position: userLocation,
            map: map,
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                rotation: heading,
                scale: 3
            }
        });
}

/*
function drawCircle()
Draws a circle around the user's location with a radius in metres equal
to the GPS accuracy

preconditions: map must exist

postconditions: a circle is drawn on the map with radius equal to the accuracy
    in metres
*/
function drawCircle(){
    // Remove any previous circles
    if (circle !== null){
        circle.setMap(null);
    }
        circle = new google.maps.Circle({
            center: userLocation,
            radius: accuracy,
            map: map
        });
}

/*
function showPath(index)
Draws a polyline from waypoint at index until the end of the path, and zooms
the map to show just this polyline

argument: index: index of the waypoint to begin the path at

preconditions: map must exist

postconditions: a polyline is drawn on the map showing each point from 
    the waypoint at index until the end of the path
*/
function showPath(index){
    // Remove any previous path lines
    if (pathToShow){
        pathToShow.setMap(null);
    }
    // Select items from index to end of path locations
    var displayPath = path.getLocations().slice(index);
    pathToShow = new google.maps.Polyline({
                path: displayPath,
                map: map,
                geodesic: true,
                strokeColor: '#0000FF',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
    
    // Create new LatLngBounds object to zoom map to
    var latlngbounds = new google.maps.LatLngBounds();
    for (var i = 0; i < displayPath.length; i++) {
        latlngbounds.extend(displayPath[i]);
    }
    // If the user's location is found, add to the bounds
    if(userLocation !== undefined){
        latlngbounds.extend(userLocation);
    }
    // Fit map to bounds
    map.fitBounds(latlngbounds);
}

/*
=====================================================================
DISPLAY
Section contains functions that output graphics and data to page
=====================================================================    
*/

/*
function drawItems()
Makes calls to all draw methods to put items onto map

preconditions: User's location must have been found
postconditions: Marker and circle are displayed on navigate.html
*/
function drawItems(){
    drawMarker();
    drawCircle();
}

/*
function displayInfo()
Makes calls to all display methods to put text and iamge
based data onto navigate.html

preconditions: User's location must have been found
postconditions: Data is displayed on navigate.html
*/
function displayInfo(){
    checkRoute();
    showDistanceWalked();
    showSpeed();
    showRemainingDistance();
    calculateETA();
}