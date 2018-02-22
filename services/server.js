
var express = require("express");
var app = express();
var _ = require("lodash");
var cors = require("cors");
var bodyParser = require("body-parser");
//var dbProvier = require("postgresadaptor");
var redis = require("redis");
//var nodemailer = require("nodemailer");
var client = redis.createClient();
const guid = require("../services/commonopration/guiidgenerator")
const mysqladaptor = require("../services/commonopration/sqlopration")
const DBNAME = 'sd_sms'
app.use(cors());
app.use(bodyParser());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
//app.use(express.static(__dirname+'/../public'));
app.use((req, res, next)=> {
    console.log(req.originalUrl)
    if(req.originalUrl != "/user/register" && req.originalUrl != "/login/userlogin" && req.originalUrl != "/login/forgotpassword"){
        console.log(req.originalUrl != "/user/register")
        client.get(req.headers.token,(error,response)=>{
            if(error){
                console.log(error)
            }else if(response){
                next();
            }else{
                res.json({message:"Invalid Token"});
            }
        })
      //next();
    }else{
        console.log('Time:', new Date())
        next()
    }
})
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

/*var modules = ["user_details","product","login"];
_(modules).forEach(function(module) {
    var router = require('./projections/' + module + '/routes/routes.js');
    var provider = require('./projections/' + module + '/dbprovider/' + 'dbprovider' + '.js');
    var repo = require('./projections/' + module + '/repository/repository.js');
    repo.init(provider);
    router.init(app, repo);
});*/

app.post("/user/login",function(req,res){
    var param = req.body
    var username = param.username
    var password = param.password
    var queryParams = [username,password]
    var query = "select * from user_details where username = ? and password = ?"
    mysqladaptor.executeQueryWithParameters(DBNAME,query,queryParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
                var token1 = guid.uuidv4();
                client.set(token1,JSON.stringify(result))
              
                if(result.data.length == 0){
                    res.staus(403).json({message:"Invalid username and password",error:true})
                }else{
                    res.json({"token":token1,result})
                }
            }
    })
})


app.post("/user/register",function(req,res){
    
    var param = req.body
    console.log(param)
    var regData = {};
    regData.user_id         = guid.uuidv4();;
    regData.first_name      = param.first_name;
    regData.middle_name     = param.middle_name;
    regData.last_name       = param.last_name;
    regData.gender          = param.gender;
    regData.stream_id       = param.stream_id;
    regData.year_id         = param.year_id;
    regData.class_id        = param.class_id;
    regData.address         = param.address;
    regData.roll_id         = param.roll_id;
    regData.image_url       = param.image_url;
    regData.student_mobile  = param.student_mobile;
    regData.parent_mobile   = param.parent_mobile;
    regData.student_email   = param.student_email;
    regData.parent_email    = param.parent_email;
    regData.dob             = param.dob;
    regData.password             = param.password;    
    mysqladaptor.insert(DBNAME,regData,"register_user",function(error,result){
        if(error){
            res.status(500).json({"error":param,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Registration Successfully"})
            }
    })
})
app.listen(9112, function() {
    console.log("Listening on " + "9111");
});
process.on('uncaughtException', function (err) {
    console.log("UNCAUGHT EXCEPTION" + err);
});

//
/*
var smtpTransport = nodemailer.createTransport("smtp.gmail.com",{
    service: "Gmail",
    auth: {
        user: "sandeeppatel344@gmail.com",
        pass: "sandeep#pune"
    }
});
    var mailOptions={
        to : "sandeeppatel344@gmail.com",
        subject : "Loyalty Server is Started",
        text : "Welcome in system."
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            res.end("error");
        }else{
            console.log("Message sent: " + response.message);
            res.end("sent");
        }
    });
*/

//var port = process.env.PORT || 9111;