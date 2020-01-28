const express = require("express");
const cors = require("cors");
const { ENV, DIRS, SERVER_CONST } = require("./constant");
const { docsRouter } = require("./docs");
var { apiRouter } = require("./api");

var sqlAPIServer_app = express();

sqlAPIServer_app.use(cors());
sqlAPIServer_app.use("/doc*", docsRouter);
sqlAPIServer_app.use("/api/v1", apiRouter);


sqlAPIServer_app.get("/", function(req, res, next) {
    res.sendFile(`${ENV.mac.app_dir}${DIRS.html}index.html`, function(err) {
        if (err) {
            res.send("<h4>Error sending file</h4>");
        }
    });
});

sqlAPIServer_app.get("/css/*.css", function(req, res, next) {
    var fileName = /[\w-]+\.[\w-]+/.exec(req.path)[0];
    if (fileName.length > 0) {
        res.sendFile(`${ENV.mac.app_dir}${DIRS.css}${fileName}`, function(err) {
            if (err) {
                console.log(err);
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