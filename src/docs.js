var express = require("express");
var { ENV, DIRS } = require("./constant");

var docsRouter = express.Router();

docsRouter.get("/", function(req, res, next) {
    res.sendFile(`${ENV.mac.app_dir}${DIRS.html}docs.html`, function(err) {
        if (err) {
            console.log(err);
            res.send(`<h4>File transfer error occured.</h4>`);
        }

    });
});

docsRouter.get("/*", function(req, res, next) {
    res.redirect("/");
});

module.exports = {
    docsRouter
};