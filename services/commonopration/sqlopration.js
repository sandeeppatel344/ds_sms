var mysql      = require('mysql');
var _ = require("lodash")
//var connectionString = require("../configuration/configconstant")

var executeQuery = function(dbName, query,  callback){
    //getConnection(dbName, function(error, client, done){

        //if(error){
          //  callback(error);
           // console.log(error)
            //return;
       // }
       var connectionSql = getConnection()
       connectionSql.query(query, function(err, result) {
        connectionSql.end()
            if(err) {
                callback(err);

                return console.error('error running query', err);
            }
            else{
                var r = {};
                r.data = result.rows;
                callback(null, r);
            }
        });
    //});
};
exports.executeQuery = executeQuery;

var executeQueryWithParameters = function(dbName, query, params, callback){
    console.log(query)
    console.log(params)
    //getConnection(dbName, function(error, client, done){
      //  if(error){
        //    callback(error);
          //  return;
       // }
       var connectionSql = getConnection()
        console.log("Got connection for executing query");
        console.log(query);
        connectionSql.query(query, params,function(err, result) {
            connectionSql.end()
            if(err) {
                callback(err);

                return console.error('error running query', err);
            }
            else{
                var r = {};
                r.data = result;
                callback(null,r);
            }
        });
    //});
};

exports.executeQueryWithParameters = executeQueryWithParameters;

module.exports.insert = function(dbName, data, tablename,  callback)
{
    var keys = _.keys(data).join(',');
    var values = _.values(data);
    var i =0;
   // var placeholders  = _.map(values, function(v){ i += 1; return "$" + i; });
   var placeholders  = _.map(values, function(v){ i += 1; return "?"; });
    var insertStatement = "insert into " + tablename + "("+ keys +") values("+ placeholders.join(',') +")";
    console.log("Insert Statement fired : "+ insertStatement);
    console.log("values : "+values);
    executeQueryWithParameters(dbName, insertStatement, values, function(error, result) {
        if (error) {
            console.log("Error in inserting : " + error);
            callback(error);
        } else {
            console.log("Insertion Successfull: " + JSON.stringify(result));

            callback(null, result);
        }
    });
};

module.exports.update = function(dbName, where, data, tablename,  callback)
{
    data = data.$set;
    var keys = _.keys(data).join(',');
    var values = [];
    var i =0;
    var set="";

    _.forIn(data, function(value, key){
        if(where[key]) return;//Do not set keys which are present in where clause;
        i += 1;
        set = set.length > 1 ? set + "," : set;
        set  += key + " = $" + i;
        values.push(value);
    });
    var whereclause = "";
    _.forIn(where, function(value, key){
        i += 1;
        whereclause = whereclause.length > 1 ? whereclause+ " AND " : whereclause;
        whereclause  += key+ " = $" + i;
        values.push(value);
    });

    var updateStatement = "update " + tablename + " set "+ set + " where " + whereclause;

    executeQueryWithParameters(dbName, updateStatement, values,  function(error, result) {
        if (error) {
            callback(error);
        } else {
            callback(null, result);
        }
    });
};

var getConnection =  function(){
    console.log("Establishing connection with MYSQL");
    /* var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'me',
        password : 'secret',
        database : 'my_db'
       });*/
      //mysql.createConnection('mysql://root:sdroot@localhost/ecommerce?debug=true',callback);
    //pg.connect("postgres://postgres:root@localhost:5432/loyalty", callback);
    var connection = mysql.createConnection({
        host     : '127.0.0.1',
        user     : 'root',
        password : 'sdroot',
        database : 'ds_sms'
    });
    
    connection.connect(function(err) {
        if (err) throw err;
        //callback(error)
    });
    return connection
};