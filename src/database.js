(function(secondFunction) {
    if (typeof module === "object" && typeof exports === "object") {
        var mySQL = require("mysql");
        module.exports = secondFunction(mySQL);
    } else if (typeof define === "object" && define.amd) {
        define(["mysql"], secondFunction);
    } else if (typeof window === "object" && typeof self === "object") {
        var object = window !== undefined ? window : global;
        secondFunction(object);
    }
})(function(moduleOrObject) {

    var databaseObject = {};

    const SQL_CONFIG = {
        host: "192.168.2.87",
        port: 3306,
        user: "remote_api_user",
        password: "remoteUser@123",
        database: "sqlAPI"
    };

    databaseObject.getDatabaseConnection = function() {
        return moduleOrObject.createConnection(SQL_CONFIG);
    };

    return databaseObject;

})