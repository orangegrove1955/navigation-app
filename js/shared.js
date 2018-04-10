'use strict';
// =========================================================
//
// ENG1003 S2 2017 Assignment 2 Walking Navigation app
// shared.js
//
// Team: 78
// Authors: Matthew Williams, Paul Papadopoulous, Viseshta 
// Chandra, Teresa Li
//
// This file is available to both pages, and as such, has 
// code that is needed by both index.html and navigate.html
// It defines the Path class, as well as providing
// code to define the prefix for local storage, and to
// check whether local storage is available.
//
// =========================================================

// Prefix to use for Local Storage.
var APP_PREFIX = "monash.eng1003.navigationApp";

// Check local storage is available in browser 
var storageAvailable = null; 
if (typeof(Storage) === undefined){ 
    console.log("Local storage not available in this browser"); 
    storageAvailable = false; 
} 
else{ 
    storageAvailable = true; 
}

/*
class Path
Class to create objects containing information about paths
that are made available through accessing the ENG1003
campusnav API
*/
class Path{
    
    /*
    constructor(title, waypoints, routeIndex)
    Constructor method to create a new Path object
    
    argument: title: Name of the Path
    argument: waypoints: Array of LatLngLiterals specifying points on the path
    argument: routeIndex: Index of the Path
    
    postconditions: New Path object is created
    */
    constructor(title, waypoints, routeIndex){   
        this._title = title;
        
        this._waypoints = [];
        
        if (!(waypoints === null)){
            // Converting LatLngLiterals into LatLng class instances
            for (var i = 0; i < waypoints.length; i++){
                this._waypoints[i] = new google.maps.LatLng(waypoints[i]);
            }
        }
        
        this._routeIndex = routeIndex;
    }
    
    /*
    getTitle()
    Method to return the title of the path
    
    returns: Title of the path as string
    */
    getTitle(){
        return this._title;
    }
    
    /*
    Method to return the waypoints of the path
    When index is not given, entire array of waypoints is returned
    When index is specified, returns only the waypoint at that index
    
    arguments: index: Optional argument to specify index of waypoint requested
    
    returns: If no index, returns entire waypoint array
    returns: If index, returns waypoint at index
    */
    getLocations(index){
        if (index === undefined){
            return this._waypoints;
        }
        
        else{
            return this._waypoints[index];
        }
    }
    
    /*
    getIndex()
    Method to return the index of the path based on its prerecorded place 
    in the array given by the ENG1003 API call
    
    returns: Index of the Path object as integer
    */
    getIndex(){
        return this._routeIndex;
    }
    
    /*
    getLength()
    Method to find the total length of the path from start to end waypoints,
    using the Google Spherical Geometry API
    
    returns: Length of the path as integer in metres
    */
    getLength(){
        return Math.round(google.maps.geometry.spherical.computeLength(this.getLocations()));
    }
    
    /*
    initialiseFromPDO(pathPDO)
    Method to populate a Path object with data from a JSON PDO
    
    arguments: pathPDO: PDO containing path information
    
    preconditions: Path object must exist
    postconditions: Path object will be populated with data from PDO
    */
    initialiseFromPDO(pathPDO){
        var path = JSON.parse(pathPDO);
        
        this._title = path.title;
        
        // Converting LatLngLiterals into Google LatLng instances
        for (var i = 0; i < path.locations.length; i++){
            this._waypoints[i] = new google.maps.LatLng(path.locations[i]);
        }
        
        this._routeIndex = path.prerecordedRoutesIndex;
    }
}