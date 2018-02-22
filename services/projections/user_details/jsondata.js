const guid = require("../../commonopration/guiidgenerator")
module.exports.dataFormate = function(data){
    var obj = {}
    obj.user_guid = guid.uuidv4();
    obj.username = data.username;
    obj.password = data.password;
    obj.mobileno = data.mobileno;
    obj.user_role = data.user_role;
    obj.address = data.address;
    obj.createdby = data.user_role;
    obj.email = data.email;
    return obj;
}