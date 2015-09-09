/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

// define object that will store message data
var messages = {};
messages.results = [];

// import npm modules
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var urlpackage = require('url');
var initial = false;

var requestHandler = function(request, response) {

// state content types
  var statusCode = 200;
  var postHeader = 201;

// See the note below about CORS headers.
  var headers = defaultCorsHeaders;

// Log server requests
  console.log("Serving request type " + request.method + " for url " + request.url);

// extract url, host, port,.. from the request
  var urlInfo = urlpackage.parse(request.url, true);

// initialization
if(!initial) {
  // debugger;
  messages = fs.readFileSync(__dirname + '/backup.txt', 'utf8') || messages;
  if (typeof messages === 'string') {
    messages = JSON.parse(messages);
  }
  // debugger;
  initial = true;
}


// this statement runs when message data is either wanted or sent
  if (urlInfo.pathname === '/classes/room1' || urlInfo.pathname === '/classes/messages') {
    
    // adjust header to JSON content type
    headers['Content-Type'] = "text/JSON";

    if (request.method === 'OPTIONS') {
      headers['Content-Type'] = 'text/plain';
      response.writeHead(statusCode, headers);
      return response.end();
    }
    
    if (request.method === 'GET') {
      
      try {
        // debugger;
        response.writeHead(statusCode, headers)
        response.end(JSON.stringify(messages));
      } 

      catch (er) {
        response.statusCode = 404;
        response.end('error: ' + er.message);
      }
    } 

    else if (request.method === 'POST') {
      
      var body = '';
      response.writeHead(postHeader, headers);

      request.on('data', function(chunk) {
        body += chunk;
      });

      request.on('end', function() {
        
        try {
          messages.results.push(JSON.parse(body));
          // write messages object to file
          fs.writeFileSync(__dirname + '/backup.txt', JSON.stringify(messages), 'utf8');
          response.end(JSON.stringify(messages));
        } 

        catch (er) {
          response.statusCode = 400;
          response.end('error: ' + er.message);
        }
      });

    }
  } 
  
  
  else if(urlInfo.pathname === '/') {
    headers['Content-Type'] = 'text/html';
    response.writeHead(statusCode, headers);
    console.log(__dirname + '/client/refactor.html');
    fs.createReadStream(__dirname + '/client/refactor.html').pipe(response);
  
  } 
  else {
    // debugger;
    var content = mime.lookup('./client/' + urlInfo.pathname)
    headers['Content-Type'] = content;
    response.writeHead(statusCode, headers);
    console.log(__dirname + '/client' + urlInfo.pathname);
    // fs.createReadStream( __dirname + '/client' + urlInfo.pathname).pipe(response);
    fs.readFile(__dirname + '/client' + urlInfo.pathname, function(error, data) {
      if (error) {
        console.log('error');
      } else {
        response.end(data);
      }
    })
        
  }


};



// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "OPTIONS, GET, POST, PUT, DELETE",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

exports.requestHandler = requestHandler;

