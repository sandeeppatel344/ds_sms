module.exports.init = function(app,repo){
    var projectrepo = repo;
    app.post("/login/userlogin",function(req,res){
        projectrepo.userLogin(req,function(error,data){
        if(error){
            console.log(error)
            res.json({data:error});
        }else{
            res.json(data);
        }
        })
    })
}