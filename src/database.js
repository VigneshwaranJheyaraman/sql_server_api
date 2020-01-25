

var databaseObject = {};

const SQL_CONFIG = {
    host: "192.168.2.221",
    port: 3306,
    user: "rsql_user",
    password: "adminUser@123",
    database: "sqlAPI"
};

databaseObject.getDatabaseConnection = function () {
    return moduleOrObject.createConnection(SQL_CONFIG);
};

return databaseObject;
