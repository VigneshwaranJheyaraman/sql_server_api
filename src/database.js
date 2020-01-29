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
        database: "sqlAPI",
    };

    databaseObject.getDatabaseConnection = function(db_name = SQL_CONFIG.database, multipleStatements = false) {
        return moduleOrObject.createConnection({...SQL_CONFIG, database: db_name ? db_name : SQL_CONFIG.database, multipleStatements: multipleStatements });
    };

    databaseObject.validateQueryParams = function(paramString) {
        return /^[a-zA-Z0-9_]*$/.test(paramString);
    }

    databaseObject.mapRelationWithOperators = function(relation) {
        switch (relation) {
            case "-lt":
                return "<";
            case "-gt":
                return ">";
            case "-eq":
                return "=";
            case "-lte":
                return "<=";
            case "-gte":
                return ">=";
            case "-ne":
                return "<>";
            case "-like":
                return "LIKE";
            default:
                return undefined;
        }
    }

    databaseObject.mapLogicalWithOperator = function(logic) {
        switch (logic) {
            case "and":
                return "AND";
            case "or":
                return "OR";
            case "not":
                return "NOT";
            default:
                return undefined;
        }
    }

    return databaseObject;

})