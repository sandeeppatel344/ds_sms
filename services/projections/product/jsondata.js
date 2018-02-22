const guid = require("../../commonopration/guiidgenerator");
module.exports.dataFormat = function(data){
    var obj = {};

    obj.product_guid = guid.uuidv4();
    obj.category_id = data.category_id;
    obj.category_name = data.category_name;
    obj.product_name = data.product_name;
    obj.product_description = data.product_description;
    obj.product_image = data.product_image;
    obj.product_amount = data.product_amount;
    obj.createdby = data.user_role;
    return obj;
}