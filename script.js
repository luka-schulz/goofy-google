// Copyright (C) 2018 Cristobal Valenzuela
// 
// This file is part of RunwayML.
// 
// RunwayML is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// RunwayML is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with RunwayML.  If not, see <http://www.gnu.org/licenses/>.
// 
// ===============================================================
//
// Runway: Goofy Google 
// This example sends images between Runway and the Google Search API. The
// captions from Runway are the basis for each google search. Previosuly
// selected images are black listed.
//
// You should select HTTP from the Input Panel
// 
// Cristóbal Valenzuela
// cris@runwayml.com
//
// Modified by Luka Schulz
// hello@lukaschulz.com
//
// ===============================================================

//let canv;
//let img;
let socket;
let imageToggle = 0;
let yourKey = "AIzaSyA-J6H4RpYlo3LShNr345wfy1fjj4wP4wU";
let yourID = "006492290114220674113:v5hcbcsea2y";
let query;
let filename = "";
let counter = 0;
let fixedURL;

// Wait until the page is loaded
document.addEventListener("DOMContentLoaded", function(event) {
  init();
  
  // A variable to hold the status of the connection
  var status = document.getElementById('status');

  // Create a connection with Runway
  // You should update this address to match the URL provided by the app
   socket = io.connect('http://129.21.73.82:33100/query');
   

  // When a connection is established
  socket.on('connect', function() {
    status.innerHTML = 'Connected';
  });
  // Handle connection error (in case something is wrong and we can't connect to Runway)
  socket.on('connect_error', (error) => {
    console.error(error);
  });
  // Handle connection timeout (in case something is wrong and it's taking ages connecting to Runway)
  socket.on('connect_timeout', (timeout) => {
    console.warn(socket.io.uri,"connect_timeout",timeout);
  });

  // When there is new data coming in, update the log element
  // With im2text, an object is returned in the format:
  // {
  //   "results": [
  //     {
  //       "caption": "caption 01",
  //       "prob": 0.0014072401693329688
  //     },
  //     {
  //       "caption": "caption 02",
  //       "prob": 0.0005297117344185971
  //     },
  //     {
  //       "caption": "caption 03",
  //       "prob": 0.0005098398921959475
  //     }
  //   ]
  // }
  socket.on('update_response', function(data) {
    // Use the most probable result
    let caption = data.results[0].caption;
    
    // Generate a cpation
    createCaption( caption );
    
    // Redundant, but assign the caption to the google query vairable
    query = caption;
    
    googleImage();
  });
});

// Initiate the machine learning loop
function init() {
  createImage( "1.jpg" );
}

// Main function for creating an image that can be passed to Runway
function createImage( link ) {
  filename = getFileName( link );

  // Create an image tag
  let img = document.createElement( "img" );
  // Set the source of the iamge
  img.src = link;
  img.crossOrigin = "anonymous";

  // Check if the image has loaded, then call loaded, throw an error if not
  if( img.complete) {
    loaded();
  }
  else {
    img.addEventListener( "load", loaded );
    img.addEventListener( "error", function() {
      console.log( "error" );
    } );
  }

  // Helper function that runs only when the image has been loaded
  function loaded() {
    //    // Flag the image for CORS
    //    img.crossOrigin="anonymous" ;
    // Scale the image
    img = proportionallyScale( img );

    // Create a new canvas
    let canvas = document.createElement( "canvas" );
    canvas.width = img.width;
    canvas.height = img.height;

    let ctx = canvas.getContext( "2d" );

    // Draw the image to the canvas, height and width must be provided
    ctx.drawImage( img, 0, 0, img.width, img.height );
    // Add the image to the page
    document.body.appendChild( canvas );

    // Send the Canvas to be converted for Runway
    sendImageToRunway( canvas );
  }  
}

// Once the image has loaded
function sendImageToRunway( img ) {
  // Send the image to Runway and specify the model to use
  socket.emit( 'update_request', {
    data: img.toDataURL('image/jpeg'),
  } );
}

// Helper function for getting an images url from a Google Search JSON file
function googleImage() {
  let googleSearch = `https://www.googleapis.com/customsearch/v1?key=${yourKey}&cx=${yourID}&num=1&searchType=image&fileType=jpg&q=${query}`;
  
  // Using Google Search API and fetch to pull a JSON file for a single image
  let googleImage = fetch( googleSearch ).then( result => {
    return result.json()
  }).then(
    // Parse the JSON
    parsedJSON => parsedJSON.items["0"].link
  ).then(
    // Create the image
    link => createImage(link)
  )
}

// Helper function for scaling images to desired width (or height)
function proportionallyScale( img ) {
  // If the image is not 500px wide
  if( img.width != 500  ) {
    // Deterimne the ratio of height to width
    const scalar = img.height / img.width;

    // Make the width 500px
    img.width = 500;

    // Scale the height accordingly
    img.height = 500 * scalar;
  }

  return img;
}

// Helper function for adding div captions
function createCaption( string ) {
  // Create a div element
  const div = document.createElement( "div" );

  // Fill it with the caption that was passed in
  div.innerHTML = string;

  // Append the div to the document
  document.body.appendChild( div );
}

// Helper funciton for getting the filename from a URL
function getFileName( link ) {
  const urlParts = link.split( "/" );
  
  return urlParts[ urlParts.length - 1 ];
}