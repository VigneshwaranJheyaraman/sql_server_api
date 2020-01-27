const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const databaseConnector = require("./database");

const SERVER_CONST = {
    host: "0.0.0.0",
    port: 8080
};

const ENV = {
    win: {
        app_dir: "C:/Users/vigneshwaran.j/Desktop/sql_api_server/src/",
    },
    lin: {
        app_dir: "/home/vigneshwaran.j/sql_api_server/src/"
    },
    mac: {
        app_dir: "/Users/vigneshwaran.j/Desktop/sql_api_server/src/"
    }
};

const DIRS = {
    css: "static/css/",
    js: "static/js/",
    img: "static/img/",
    html: "static/html/"
};

var sqlAPIServer_app = express();

sqlAPIServer_app.use(cors());
sqlAPIServer_app.use(bodyParser.json());


sqlAPIServer_app.get("/", function(req, res, next) {
    res.sendFile(`${ENV.mac.app_dir}${DIRS.html}index.html`, function(err) {
        if (err) {
            console.log(err);
            res.send("<h4>Error sending file</h4>");
        }
    });
});

sqlAPIServer_app.get("/*.css", function(req, res, next) {
    var fileName = /[\w-]+\.[\w-]+/.exec(req.path)[0];
    if (fileName.length > 0) {
        res.sendFile(`${ENV.mac.app_dir}${DIRS.css}${fileName}`, function(err) {
            if (err) {
                res.send("<h4>Error sending file</h4>");
            }
        });
    }
});


sqlAPIServer_app.get("/img/*", function(req, res, next) {
    var imageName = /[\w-]+\.[\w-]+/.exec(req.path);
    if (imageName) {
        res.sendFile(`${ENV.mac.app_dir}${DIRS.img}${imageName}`, function(err) {
            if (err) {
                res.send("<h1>Some error occured while sending img");
            }
        })
    }
});

sqlAPIServer_app.get("/*.js", function(req, res, next) {
    var fileName = /[\w-]+\.[\w-]+/.exec(req.path);
    if (fileName) {
        res.sendFile(`${ENV.mac.app_dir}${DIRS.js}${fileName}`, function(Err) {
            if (Err) {
                res.send("<h4> Error sending file</h4>");
            }
        });
    }
});


sqlAPIServer_app.listen(SERVER_CONST.port, SERVER_CONST.host, function(event) {
    console.log("Server listening on " + SERVER_CONST.host + " at " + SERVER_CONST.port);
})