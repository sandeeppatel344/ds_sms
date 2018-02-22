module.exports.init = function(provider){
    this.provider = provider
}

module.exports.saveUserDetails = function(req,callback){
    this.provider.saveUserDetails(req,callback)
}