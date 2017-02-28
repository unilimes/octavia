var connect = require("connect");
var less = require('less');
var serveStatic = require("serve-static");

connect().use(serveStatic(__dirname)).listen(3000);

console.log("Server started on port *:3000!");
