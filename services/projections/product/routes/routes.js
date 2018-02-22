module.exports.init = function(app,repo){
    var projectrepo = repo;
    app.post("/save/saveProducts",function(req,res){
        projectrepo.saveProducts(req,function(error,data){
        if(error){
            console.log(error)
            res.json({data:error});
        }else{
            res.json(data);
        }
        })
    })
}