'use strict';
// =========================================================
//
// ENG1003 S2 2017 Assignment 2 Walking Navigation app
// mainPage.js
//
// Team: 78
// Authors: Matthew Williams, Paul Papadopoulous, Viseshta 
// Chandra, Teresa Li
//
// This file creates a list of paths that can be selected
// by a user, in order to display these paths on a map.
//
// =========================================================


/*
initPage()
Initialises the page when loaded, adding a new script to index.html
to retrieve paths from the Campusnav API

postconditions: New script added to index.html
*/
function initPage(){
    var url = "https://eng1003.monash/api/campusnav/?campus=clayton&callback=getPaths";
    var script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
}

/* 
function viewPath(pathIndex) 
Stores the index of the selected path to local storage for use on the navigate page 
and loads navigate.html 
 
argument: pathIndex: Index of the path selected by the user 
 
Postconditions: Loads navigate.html, stores pathIndex to local storage
*/ 
function viewPath(pathIndex){
    // Save the selected path index to local storage so it can be accessed
    // from the Navigate page.
    if (storageAvailable){ 
        localStorage.setItem(APP_PREFIX + "-selectedPath", pathIndex); 
    }
    // Load the Navigate page.
    location.href = 'navigate.html';
}

/*
function getPaths(paths)
Creates a string of HTML elements each corresponding to an individual entry in the 
list of paths available as returned by the campusnav API

argument: paths: List of paths given by campusnav API

Preconditions: Campusnav API must have been called
Postconditions: HTML list elements are added to the DOM inside of element "pathsList"
*/
function getPaths(paths){

    // Create empty string to append list elements to
    var pathHTML = "";
    // For each path in the list, construct a list HTML element and Path object
    for (var i = 0; i < paths.length; i++){

        var pathObject = new Path(paths[i].title, paths[i].locations, i);
        
        // Get the length of the path
        var pathLength = pathObject.getLength();
        
        // Add each element to the path string
        pathHTML += "<li class=\"mdl-list__item mdl-list__item--two-line\" onclick=\"viewPath(" + i + ");\">\
                        <span class=\"mdl-list__item-primary-content\">" + 
                               pathObject.getTitle() + "<span class=\"mdl-list__item-sub-title\">Path length: " + pathLength + 
                            " meters</span>\
                        </span>\
                    </li>";
        // Save the path from campusnav API to local storage
        savePath(paths, i);
    }
    // Add all elements to the DOM at "pathsList" to view
    document.getElementById("pathsList").innerHTML = pathHTML;
}

/*
function savePath(paths, pathIndex)
Saves a stringified version of a path to local storage with the name "monash.eng1003.navigationApp-path{pathIndex}" without the curly braces
                            
argument: paths: List of paths to stringify
argument: pathIndex: Index of the path in the list to use for storage name

Preconditions: Local storage must be available
Postconditions: New local storage item saved
*/
function savePath(paths, pathIndex){
    // Check if local storage is available
    if (storageAvailable){
        // Stringify path
        var pathAsJSON = JSON.stringify(paths[pathIndex]);
        // Save JSON path to local storage
        localStorage.setItem(APP_PREFIX + "-path" + pathIndex, pathAsJSON);
    }
}