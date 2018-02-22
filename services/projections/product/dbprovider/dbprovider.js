const mysqladaptor = require("../../../commonopration/sqlopration")
const formateData = require("../jsondata")
var fs = require('fs');
const DBNAME = 'ecommerce'
module.exports.saveProducts = function(req,callback){    
    var data = formateData.dataFormat(req.body)
    mysqladaptor.insert(DBNAME,data,"product",function(error,result){
        if(error){
            callback(error)
            return
        }

        callback({data:{message:"save successfully."}})
    })
}