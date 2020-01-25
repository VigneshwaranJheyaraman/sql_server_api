const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const databaseConnector = require("./database");

const SERVER_CONST = {
    host:"0.0.0.0",
    port:8080
}

var sqlAPIServer_app = express();

sqlAPIServer_app.use(cors());
sqlAPIServer_app.use(bodyParser.json());


sqlAPIServer_app.get("/", function(request, response, next){
    response.redirect("/docs");
});

sqlAPIServer_app.get("/docs",function(req, res, next){
    res.sendFile("C:/Users/vigneshwaran.j/Desktop/sqlServer/src/docs.html", function(err){
        if(err){
            console.log(err);
            res.send("<h4>Error sending file</h4>");
        }
    });
});

sqlAPIServer_app.listen(SERVER_CONST.port, SERVER_CONST.host, function(event){
    console.log("Server listening on "+ SERVER_CONST.host + " at "+ SERVER_CONST.port);
})
