// app.js
var express = require('express');
var app = express();
var path = require('path');

// A sample route
// viewed at http://localhost:3000/
app.get('/', function(req, res) {
    app.use(express.static(__dirname + '/web' ));
    res.sendFile('./index.html', { root: __dirname + '/web' });
});

// Start the Express server
app.listen(3000, () => console.log('Server running on port 3000! Visit http://localhost:3000/ to see your Shipengquin site!'))