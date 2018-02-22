module.exports.init = function(provider){
    this.provider = provider
}

module.exports.saveProducts = function(req,callback){
    this.provider.saveProducts(req,callback)
}