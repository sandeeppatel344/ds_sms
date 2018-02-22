const mysqladaptor = require("../../../commonopration/sqlopration")
const formateData = require("../jsondata")
var fs = require('fs');
const DBNAME = 'ecommerce'
module.exports.saveUserDetails = function(req,callback){     
    var data = formateData.dataFormate(req.body)
    mysqladaptor.insert(DBNAME,data,"user_details",function(error,result){
        if(error){
            callback(error)
            return
        }
     
        
    })
}