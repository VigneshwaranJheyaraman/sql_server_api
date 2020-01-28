const express = require("express");
const bodyParser = require("body-parser");
const databaseConnector = require("./database");

var apiRouter = express.Router();

apiRouter.use(bodyParser.json({ type: "*/*" }));

apiRouter.use((req, res, next) => {
    var req_body = req.body.request;
    const SQL_MAIN_TABLES = ["information_schema", "mysql", "performance_schema", "sys"];
    if (req_body.d_name) {
        if (SQL_MAIN_TABLES.includes(req_body.d_name)) {
            res.json(getResponse(501, "Not Implemented", { msg: `Error Error: ER_DBACCESS_DENIED_ERROR: Access denied for remote user to database '${req_body.d_name}' occured` }))
        }
    }
    next();
});


const SETTER = {
    insert: "/post/table/insert",
    delete: "/post/table/delete",
    update: "/post/table/update",
    filter: "/post/table/filter",
    createDB: "/post/db/create",
    deleteDB: "/post/db/delete",
    createTab: "/post/table/create",
    deletTab: "/post/table/delete",
    updateTable: "/post/table/alter"
};

const GETTER = {
    tabelData: "/get/table",
};

const REQUEST_OPTIONS = {
    [GETTER.tabelData]: ["d_name", "t_name"],
    [SETTER.createDB]: ["d_name"],
    [SETTER.createTab]: ["d_name", "t_name", "fields"]
}

function getResponse(statCode, status, resp) {
    return {
        response: {
            code: statCode,
            status: status,
            result: resp
        }
    };
}

apiRouter.get("/", function(req, res, next) {
    res.redirect("/docs");
});

apiRouter.post(GETTER.tabelData, function(req, res, next) {
    var req_body = req.body.request;
    REQUEST_OPTIONS[GETTER.tabelData].forEach(key => {
        if (!Object.keys(req_body).includes(key)) {
            res.json(getResponse(400, "Bad Request", { msg: `Missing param ${key}` }));
        }
    });
    var connection = databaseConnector.getDatabaseConnection(req_body.d_name);
    connection.connect();
    connection.query(`SELECT ${req_body.fields && req_body.fields.length > 0 ? req_body.fields.toString() : "*"} from ${req_body.t_name};`, function(err, results, fields) {
        if (err) {
            res.json(getResponse(501, "Not Implemented", { msg: err.toString() }));
        } else {
            res.json(getResponse(200, "Successfull", results));
        }
    });
    connection.end();
});

apiRouter.post(SETTER.createDB, function(req, res, next) {
    var req_body = req.body.request;
    REQUEST_OPTIONS[SETTER.createDB].forEach(key => {
        if (!Object.keys(req_body).includes(key)) {
            res.json(getResponse(400, "Bad Request", { msg: `Missing Param ${key}` }));
        }
    });
    var connection = databaseConnector.getDatabaseConnection(undefined, true);
    connection.query(`create database ${req_body.d_name};grant all privileges on ${req_body.d_name} to 'remote_api_user'@'%';`, function(err, results, fields) {
        if (err) {
            res.json(getResponse(501, "Not Implemented", { msg: err.toString() }));
        } else {
            res.json(getResponse(201, "Successfully created", { result: `${req_body.d_name} database created` }));
        }
    });
    connection.end();
});

apiRouter.post(SETTER.deleteDB, function(req, res, next) {
    var request_body = req.body.request;
    //same param as create db
    REQUEST_OPTIONS[SETTER.createDB].forEach(key => {
        if (!Object.keys(request_body).includes(key)) {
            res.json(getResponse(400, "Bad Request", { msg: `Missing param ${key}` }));
        }
    });
    var connection = databaseConnector.getDatabaseConnection(request_body.d_name);
    connection.query(`drop database ${request_body.d_name};`, function(err, results, fields) {
        if (err) {
            res.json(getResponse(501, "Not Implemented", { msg: `Error ${err.toString()} occured` }));
        } else {
            res.json(getResponse(202, "Accepted", { msg: `Succesfully deleted ${request_body.d_name}` }));
        }
    });
    connection.end();
});

apiRouter.post(SETTER.createTab, function(req, res, next) {
    var request_body = req.body.request;
    //same as get table reques
    REQUEST_OPTIONS[SETTER.createTab].forEach(key => {
        if (!Object.keys(request_body).includes(key)) {
            res.json(getResponse(401, "Bad Request", { msg: `Missing param ${key}` }));
        }
    });
    var connection = databaseConnector.getDatabaseConnection(request_body.d_name);
    var query = `create table ${request_body.t_name}(`;
    /*
        fields data body
        [
            {
                name:field_name,
                type:field_type,
                length:field_length,
                not_null:field_prop,
                is_primary:field_prop,
                auto_increment:field_prop,
            }
        ]
    */
    request_body.fields.forEach(field => {
        query += field.name + " ";
        query += field.type + "(";
        query += field.length + ")";
        query += field.not_null ? " not null " : "";
    });
});

module.exports = { apiRouter }