const express = require("express");
const bodyParser = require("body-parser");
const databaseConnector = require("./database");

var apiRouter = express.Router();

apiRouter.use(bodyParser.json({ type: "*/*" }));

//middleware validation of user
apiRouter.use((req, res, next) => {
    var req_body = req.body.request;
    const SQL_MAIN_TABLES = ["information_schema", "mysql", "performance_schema", "sys"];
    if (req_body.d_name) {
        if (!databaseConnector.validateQueryParams(req_body.d_name) || SQL_MAIN_TABLES.includes(req_body.d_name)) {
            res.json(getResponse(501, "Not Implemented", { response: `Error Error: ER_DBACCESS_DENIED_ERROR: Access denied for remote user to database '${req_body.d_name}' occured` }));
        } else if (req_body.t_name) {
            if (!databaseConnector.validateQueryParams(req_body.t_name)) {
                res.json(getResponse(501, "Not Implemented", { response: `Error Error: ER_DBACCESS_DENIED_ERROR: Access denied for remote user to database '${req_body.d_name}' occured` }));
            } else {
                next();
            }
        } else {
            next();
        }
    } else {
        res.json(getResponse(400, "Bad request", { response: "Missing param d_name" }));
    }
});

function filterQuery(initQuery, filterObject) {
    filterObject.forEach(filter => {
        if (filter.constructor.toString() === "function Array() { [native code] }") {
            try {
                if (filter[3] === "1") {
                    //not
                    initQuery += databaseConnector.mapLogicalWithOperator("not") + " ";
                    initQuery += filter[0] + " ";
                    initQuery += databaseConnector.mapRelationWithOperators(filter[1]) + " ";
                    initQuery += "'" + filter[2] + "'";
                } else {
                    //no not
                    initQuery += filter[0] + " ";
                    initQuery += databaseConnector.mapRelationWithOperators(filter[1]) + " ";
                    initQuery += "'" + filter[2] + "'";
                }
            } catch (err) {
                throw err;
            }
        } else {
            //relation
            initQuery += " " + databaseConnector.mapLogicalWithOperator(filter) + " ";
        }
    });
    return initQuery;
}

const SETTER = {
    insert: "/post/table/insert",
    delete: "/post/table/delete",
    update: "/post/table/update",
    filter: "/post/table/filter",
    createDB: "/post/db/create",
    deleteDB: "/post/db/drop",
    createTab: "/post/table/create",
    deletTab: "/post/table/drop",
};

const GETTER = {
    tabelData: "/get/table",
};

const REQUEST_OPTIONS = {
    [GETTER.tabelData]: ["d_name", "t_name"],
    [SETTER.createDB]: ["d_name"],
    [SETTER.createTab]: ["d_name", "t_name", "fields"],
    [SETTER.delete]: ["d_name", "t_name", "filter"],
    [SETTER.update]: ["d_name", "t_name", "updates", "filter"]
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
            res.json(getResponse(400, "Bad Request", { response: `Missing param ${key}` }));
        }
    });
    var connection = databaseConnector.getDatabaseConnection(req_body.d_name);
    connection.connect();
    connection.query(`SELECT ${req_body.fields && req_body.fields.length > 0 ? req_body.fields.toString() : "*"} from ${req_body.t_name};`, function(err, results, fields) {
        if (err) {
            res.json(getResponse(501, "Not Implemented", { response: err.code }));
        } else {
            res.json(getResponse(200, "Successfull", { response: results }));
        }
    });
    connection.end();
});

apiRouter.post(SETTER.createDB, function(req, res, next) {
    var req_body = req.body.request;
    REQUEST_OPTIONS[SETTER.createDB].forEach(key => {
        if (!Object.keys(req_body).includes(key)) {
            res.json(getResponse(400, "Bad Request", { response: `Missing Param ${key}` }));
        }
    });
    var connection = databaseConnector.getDatabaseConnection(undefined, true);
    connection.query(`create database ${req_body.d_name};grant all privileges on ${req_body.d_name} to 'remote_api_user'@'%';`, function(err, results, fields) {
        if (err) {
            res.json(getResponse(501, "Not Implemented", { response: err.code }));
        } else {
            res.json(getResponse(201, "Successfully created", { response: `${req_body.d_name} database created` }));
        }
    });
    connection.end();
});

apiRouter.post(SETTER.deleteDB, function(req, res, next) {
    var request_body = req.body.request;
    //same param as create db
    REQUEST_OPTIONS[SETTER.createDB].forEach(key => {
        if (!Object.keys(request_body).includes(key)) {
            res.json(getResponse(400, "Bad Request", { response: `Missing param ${key}` }));
        }
    });
    var connection = databaseConnector.getDatabaseConnection(request_body.d_name);
    connection.query(`drop database ${request_body.d_name};`, function(err, results, fields) {
        if (err) {
            res.json(getResponse(501, "Not Implemented", { response: `Error ${err.code} occured` }));
        } else {
            res.json(getResponse(201, "Accepted", { response: `Succesfully deleted ${request_body.d_name}` }));
        }
    });
    connection.end();
});

apiRouter.post(SETTER.createTab, function(req, res, next) {
    var request_body = req.body.request;
    //same as get table reques
    REQUEST_OPTIONS[SETTER.createTab].forEach(key => {
        if (!Object.keys(request_body).includes(key)) {
            res.json(getResponse(400, "Bad Request", { response: `Missing param ${key}` }));
        }
        if (key === "fields") {
            if (request_body.fields.length <= 0) {
                res.json(getResponse(400, "Bad Request", { response: "Fields length must not be empty" }));
            }
        }
    });
    if (request_body.fields && request_body.fields.length > 0) {
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
                    is_unique:field_prop
                    auto_increment:field_prop,
                }
                ...
            ]
        */

        request_body.fields.forEach(field => {
            query += field.name + " ";
            query += (field.type === "string" ? "varchar" : field.type) + "(";
            query += (field.length ? field.length : "3") + ")";
            query += field.not_null ? " not null " : "";
            query += field.is_primary ? "primary key" : "";
            query += field.auto_increment ? "auto_increment" : "";
            query += field.is_unique ? "unique" : "";
            query += ","
        });

        query = query.slice(0, query.length - 1);
        query += ');'
        var connection = databaseConnector.getDatabaseConnection(request_body.d_name);
        connection.connect();
        connection.query(query, function(err, results, fields) {
            if (err) {
                res.json(getResponse(501, "Not Implemented", { response: err.code }));
            } else {
                res.json(getResponse(201, "Created successfully", { response: `${request_body.t_name} table created for database ${request_body.d_name}` }));
            }
        });
        connection.end();
    } else {
        res.json(getResponse(400, "Bad Request", { response: "Missing param fields" }))
    }
});

apiRouter.post(SETTER.deletTab, function(req, res, next) {
    var requestBody = req.body.request;
    //same as tableData
    REQUEST_OPTIONS[GETTER.tabelData].forEach(key => {
        if (!Object.keys(requestBody).includes(key)) {
            res.json(getResponse(400, "Bad request", { response: `Missing param ${key}` }));
        }
    });
    var connection = databaseConnector.getDatabaseConnection(requestBody.d_name);
    connection.connect();
    connection.query(`drop table ${requestBody.t_name};`, function(err, result, fields) {
        if (err) {
            res.json(getResponse(501, "Not Implemented", { response: err.code }));
        } else {
            res.json(getResponse(202, "Accepted", { response: `Successfully deleted table ${requestBody.t_name} from database ${requestBody.d_name}` }));
        }
    });
    connection.end();
});

apiRouter.post(SETTER.insert, function(req, res, next) {
    var requestBody = req.body.request;
    //same as create table
    REQUEST_OPTIONS[SETTER.createTab].forEach(key => {
        if (!Object.keys(requestBody).includes(key)) {
            res.json(getResponse(401, "Bad Request", { response: `Missing param ${key}` }));
        }
        if (key === "fields") {
            if (requestBody.fields.length <= 0) {
                res.json(getResponse(400, "Bad Request", { response: "Fields length must not be empty" }));
            }
        }
    });
    /*
    field options
    fields = [
        {
            column_name: column_value
        }
        ...
    ]
    */
    var connection = databaseConnector.getDatabaseConnection(requestBody.d_name);
    connection.connect();
    connection.query(`insert into ${requestBody.t_name}(${Object.keys(requestBody.fields[0])}) values ?;`, [requestBody.fields.map(field => Object.values(field))], function(err, results, field) {
        if (err) {
            res.json(getResponse(501, "Not Implemented", { response: err.code }));
        } else {
            res.json(getResponse(201, "Accepted", { response: `Successfully inserted ${requestBody.fields.length} values into ${requestBody.t_name}` }));
        }
    });
    connection.end();
});

apiRouter.post(SETTER.delete, function(req, res, next) {
    var requestBody = req.body.request;
    REQUEST_OPTIONS[SETTER.delete].forEach(key => {
        if (!Object.keys(requestBody).includes(key)) {
            res.json(getResponse(400, "Bad request", { response: `Missing param ${key}` }));
        }
    });
    /*
    filter object structure
    filter = [
        ["col_name", "rel", "value", "is_not"] , "rel" , ["col_name","rel","value", "is_not = 1/0"]
        ...
    ]
    if type is array
        -then where condition
        -is_not ==1 ? NOT : ""
    else
        -and/or/not
    */
    var query = `delete from ${requestBody.t_name} where `;
    try {
        query = filterQuery(query, requestBody.filter);
    } catch (err) {
        res.json(getResponse(400, "Bad request", { response: err.toString() }));
    }
    var connection = databaseConnector.getDatabaseConnection(requestBody.d_name);
    connection.connect();
    connection.query(query, function(err, results, fields) {
        if (err) {
            res.json(getResponse(501, "Not Implemented", { response: err.code }));
        } else {
            res.json(getResponse(201, "Accepted", { response: `Successfully deleted data from ${requestBody.t_name} based on provided filter` }));
        }
    });
    connection.end();
});

apiRouter.post(SETTER.filter, function(req, res, next) {
    var requestBody = req.body.request;
    REQUEST_OPTIONS[SETTER.delete].forEach(key => {
        if (!Object.keys(requestBody).includes(key)) {
            res.json(getResponse(400, "Bad request", { response: `Missing param ${key}` }));
        }
    });
    var query = `select ${requestBody.fields && requestBody.fields.length > 0 ? requestBody.fields.toString() : "*"} from ${requestBody.t_name} where `;
    try {
        query = filterQuery(query, requestBody.filter);
    } catch (err) {
        res.json(getResponse(400, "Bad request", { response: err.toString() }));
    }
    var connection = databaseConnector.getDatabaseConnection(requestBody.d_name);
    connection.connect();
    connection.query(query, function(err, results, fields) {
        if (err) {
            res.json(getResponse(501, "Not Implemented", { response: err.code }));
        } else {
            res.json(getResponse(200, "Successful", { response: results }));
        }
    });
    connection.end();
});

apiRouter.post(SETTER.update, function(req, res, next) {
    var requestBody = req.body.request;
    REQUEST_OPTIONS[SETTER.update].forEach(key => {
        if (!Object.keys(requestBody).includes(key)) {
            res.json(getResponse(400, "Bad request", { response: `Missing param ${key}` }));
        }
    });
    var query = `update ${requestBody.t_name} set `;
    /*
        updates = [
            [col_name, value],
            [col_name, value],
            ...
        ]
    */
    requestBody.updates.forEach(update => {
        query += update[0] + " = '" + update[1] + "' ";
    });
    query += "where ";
    query = filterQuery(query, requestBody.filter);
    var connection = databaseConnector.getDatabaseConnection(requestBody.d_name);
    connection.connect();
    connection.query(query, function(err, results, fields) {
        if (err) {
            res.json(getResponse(501, "Not Implemented", { response: err.code }));
        } else {
            res.json(getResponse(201, "Accepted", { response: `Updated the fields ${requestBody.updates.map(v => v[0]).toString()} on table ${requestBody.t_name}` }));
        }
    });
    connection.end();
});

module.exports = { apiRouter }