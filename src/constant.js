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

module.exports = {
    SERVER_CONST,
    ENV,
    DIRS
};