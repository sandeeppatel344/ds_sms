
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
/*app.use((req, res, next)=> {
    console.log(req.originalUrl)
    if(req.originalUrl != "/user/register" && req.originalUrl != "/user/login" && req.originalUrl != "/user/forgotpass"){
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
})*/


app.post("/user/login",function(req,res){
    var param = req.body
    var username = param.username
    var password = param.password
    var queryParams = [username,password]
    var query = "select id,user_id,first_name,middle_name,last_name,gender,stream_id,year_id,class_id,address,roll_id,image_url,student_mobile,parent_mobile,student_email,parent_email,dob from register_user where student_mobile = ? and password = ?"
    mysqladaptor.executeQueryWithParameters(DBNAME,query,queryParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){              
              
                if(result.data.length == 0){
                    res.status(403).json({message:"Invalid username and password",error:true})
                }else{
                  //  var token1 = guid.uuidv4();
                   // client.set(token1,JSON.stringify(result))
                    res.json(result)
                }
            }
    })
})


app.post("/user/forgotpass",function(req,res){
    var param = req.body
    var resetP = {};
    //resetP.student_mobile = param.student_mobile;
    resetP.password = param.password;
    var where = {"student_mobile":param.student_mobile}
    mysqladaptor.update(DBNAME,where,resetP,"register_user",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Registration Successfully"})
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
    regData.password        = param.password;
    regData.fcm             = param.fcm;    
    mysqladaptor.insert(DBNAME,regData,"register_user",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Registration Successfully"})
            }
    })
})


var FCM = require('fcm-push');

var serverKey = 'AAAAmYqR-l0:APA91bFNFoTisq3Ba1CoIqnhfWcUzMeP500HBGLoFq0hdckEu7Mwv2JjmGwZ55zT7FM0aeA-HZjL71sEoSqVTyoSnuwzUyaZLI6yLe995gNgvnImTvEL1REnkacjikGUPyCv8eRLJtfF';
var fcm = new FCM(serverKey);

var pushNotification = function(data,fcmarra,title,body){
    //var message = [];
    //_.each(fcmarra,(fcmid)=>{
        //'evcfOUvAgTA:APA91bFH1gphJuL0qLRjBHHCe2raTFnVyEz3e6rogi6yrYQNXPsoTM3dnEkN3ACvRX5u-L3If0dhIFJ8QJT5XQUHunSiWEpRqJlv-pybCocEiRBcvcdSSlP6OFOl2_G0fjavN8nsQXfv', // required fill with device token or topics
        var message = {
            to: fcmarra,
            collapse_key: 'your_collapse_key', 
            data: {
                your_custom_data_key: data
            },
            notification: {
                title: title,
                body: body,
                icon : 'icon_notification',
                color : '#059A79',
                sound : 'notification'
            }
        };
      //  message.push(message1)
        
    //})
    
    //callback style
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
    
    //promise style
    fcm.send(message)
        .then(function(response){
            console.log("Successfully sent with response: ", response);
        })
        .catch(function(err){
            console.log("Something has gone wrong!");
            console.error(err);
        })
    
}

//==============================================================================
app.post("/save/stream",function(req,res){
    
    var param = req.body
    console.log(param)
    var streamData = {};
        streamData.stream_name = param.stream_name
    mysqladaptor.insert(DBNAME,streamData,"stream",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Stream Saved Successfully"})
            }
    })
})

app.get("/get/stream",function(req,res){
    var query = "select * from stream"
    mysqladaptor.executeQuery(DBNAME,query,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json(result)
            }
    })
})


app.post("/edit/stream",function(req,res){
    var param = req.body
    var editStremObj = {};
    //resetP.student_mobile = param.student_mobile;
    editStremObj.stream_name = param.stream_name;
    var where = {"id":param.id}
    mysqladaptor.update(DBNAME,where,editStremObj,"stream",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Stream Updated Successfully"})
            }
    })
})

app.post("/delete/stream",function(req,res){
    var param = req.body
    var editStremObj = {};
    var dQuery = "delete from stream where id = ?"
    var dParams = [param.id];
    mysqladaptor.executeQueryWithParameters(DBNAME,dQuery,dParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Stream Deleted Successfully"})
            }
    })
})


app.post("/get/streambyid",function(req,res){
    var param = req.body
    var editStremObj = {};
    var dQuery = "select * from stream where id = ?"
    var dParams = [param.id];
    mysqladaptor.executeQueryWithParameters(DBNAME,dQuery,dParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json(result)
            }
    })
})

//======================================================================
app.post("/save/class",function(req,res){
    
    var param = req.body
    console.log(param)
    var classData = {};
    classData.class_name = param.class_name
    mysqladaptor.insert(DBNAME,classData,"class",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Class Saved Successfully"})
            }
    })
})



app.get("/get/class",function(req,res){
    var query = "select * from class"
    mysqladaptor.executeQuery(DBNAME,query,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json(result)
            }
    })
})


app.post("/edit/class",function(req,res){
    var param = req.body
    var editClassObj = {};
    //resetP.student_mobile = param.student_mobile;
    editClassObj.class_name = param.class_name;
    var where = {"id":param.id}
    mysqladaptor.update(DBNAME,where,editClassObj,"class",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Class Updated Successfully"})
            }
    })
})

app.post("/delete/class",function(req,res){
    var param = req.body
    var editStremObj = {};
    var dQuery = "delete from class where id = ?"
    var dParams = [param.id];
    mysqladaptor.executeQueryWithParameters(DBNAME,dQuery,dParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Class Deleted Successfully"})
            }
    })
})

app.post("/get/classbyid",function(req,res){
    var param = req.body
    var editStremObj = {};
    var dQuery = "select * from class where id = ?"
    var dParams = [param.id];
    mysqladaptor.executeQueryWithParameters(DBNAME,dQuery,dParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json(result)
            }
    })
})

//=========================================================================
app.post("/save/year",function(req,res){
    
    var param = req.body
    console.log(param)
    var yearData = {};
    yearData.year_name = param.year_name
    mysqladaptor.insert(DBNAME,yearData,"year",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Year Saved Successfully"})
            }
    })
})


app.get("/get/year",function(req,res){
    var query = "select * from year"
    mysqladaptor.executeQuery(DBNAME,query,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json(result)
            }
    })
})


app.post("/edit/year",function(req,res){
    var param = req.body
    var editYearObj = {};
    //resetP.student_mobile = param.student_mobile;
    editYearObj.year_name = param.year_name;
    var where = {"id":param.id}
    mysqladaptor.update(DBNAME,where,editYearObj,"year",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Year Updated Successfully"})
            }
    })
})

app.post("/delete/year",function(req,res){
    var param = req.body
    var editStremObj = {};
    var dQuery = "delete from year where id = ?"
    var dParams = [param.id];
    mysqladaptor.executeQueryWithParameters(DBNAME,dQuery,dParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Year Deleted Successfully"})
            }
    })
})

app.post("/get/yearbyid",function(req,res){
    var param = req.body
    var editStremObj = {};
    var dQuery = "select * from year where id = ?"
    var dParams = [param.id];
    mysqladaptor.executeQueryWithParameters(DBNAME,dQuery,dParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json(result)
            }
    })
})

//================================================================================
app.post("/save/category",function(req,res){
    
    var param = req.body
    console.log(param)
    var categoryData = {};
    categoryData.year_name = param.category_name
    mysqladaptor.insert(DBNAME,categoryData,"category",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Category Saved Successfully"})
            }
    })
})


app.get("/get/category",function(req,res){
    var query = "select * from category"
    mysqladaptor.executeQuery(DBNAME,query,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json(result)
            }
    })
})


app.post("/edit/category",function(req,res){
    var param = req.body
    var editCategoryObj = {};
    //resetP.student_mobile = param.student_mobile;
    editCategoryObj.category_name = param.category_name;
    var where = {"id":param.id}
    mysqladaptor.update(DBNAME,where,editCategoryObj,"category",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Category Updated Successfully"})
            }
    })
})
app.post("/delete/category",function(req,res){
    var param = req.body
    var editStremObj = {};
    var dQuery = "delete from category where id = ?"
    var dParams = [param.id];
    mysqladaptor.executeQueryWithParameters(DBNAME,dQuery,dParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Category Deleted Successfully"})
            }
    })
})


app.post("/get/categorybyid",function(req,res){
    var param = req.body
    var editStremObj = {};
    var dQuery = "select * from category where id = ?"
    var dParams = [param.id];
    mysqladaptor.executeQueryWithParameters(DBNAME,dQuery,dParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json(result)
            }
    })
})

//==============================================================================
app.post("/save/division",function(req,res){
    
    var param = req.body
    console.log(param)
    var divisionData = {};
    divisionData.division_name = param.division_name
    mysqladaptor.insert(DBNAME,divisionData,"division",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Division Saved Successfully"})
            }
    })
})

app.get("/get/division",function(req,res){
    var query = "select * from division"
    mysqladaptor.executeQuery(DBNAME,query,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json(result)
            }
    })
})


app.post("/edit/division",function(req,res){
    var param = req.body
    var editDivisionObj = {};
    //resetP.student_mobile = param.student_mobile;
    editDivisionObj.division_name = param.category_name;
    var where = {"id":param.id}
    mysqladaptor.update(DBNAME,where,editDivisionObj,"division",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Category Updated Successfully"})
            }
    })
})
app.post("/delete/devision",function(req,res){
    var param = req.body
    var editStremObj = {};
    var dQuery = "delete from division where id = ?"
    var dParams = [param.id];
    mysqladaptor.executeQueryWithParameters(DBNAME,dQuery,dParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Devision Deleted Successfully"})
            }
    })
})
app.post("/get/divisionbyid",function(req,res){
    var param = req.body
    var editStremObj = {};
    var dQuery = "select * from division where id = ?"
    var dParams = [param.id];
    mysqladaptor.executeQueryWithParameters(DBNAME,dQuery,dParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json(result)
            }
    })
})

//====================================================================


app.post("/save/notice",function(req,res){
    
    var param = req.body
    console.log(param)
    var noticeData = {};
    noticeData.class_id = param.class_id;
    noticeData.title = param.title;
    noticeData.description = param.description;
    noticeData.notice_date = param.notice_date;
    noticeData.category_id = param.category_id;
    mysqladaptor.insert(DBNAME,noticeData,"notice",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
            var user_query="select fcm from register_user where class_id = ?";
            mysqladaptor.executeQueryWithParameters(DBNAME,user_query,[noticeData.class_id],function(erro,result){
                if(result&&noticeData.description&&noticeData.title){
                    var FCM_IDD = "d_9HvmEjTZE:APA91bFqXhrz1WlfqqrD-b1357QOjVcsf4tN7iC-tOjNbY559qA39WtzFuz1sNu8M8DJoJ3z2sKOsFq7j8QYz0mkgR8OJcKlEHl6sgFurJQJuDP8aDtykAEXWSVKzw_JeYil7sLj5boY"
                pushNotification(noticeData.title,FCM_IDD,noticeData.title,noticeData.description)
            }
            })
            
               res.json({"message":"Notice Saved Successfully"})
            }
    })
})

app.post("/get/noticebyclass",function(req,res){
    var query = "select * from division where class_id = ?"
    var param = req.body;
    var queryParams = [param.user_id]
    mysqladaptor.executeQueryWithParameters(DBNAME,query,queryParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json(result)
            }
    })
})

/*
app.post("/edit/notice",function(req,res){
    var param = req.body
    var editDivisionObj = {};
    //resetP.student_mobile = param.student_mobile;
    editDivisionObj.division_name = param.category_name;
    var where = {"id":param.id}
    mysqladaptor.update(DBNAME,where,editDivisionObj,"division",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Category Updated Successfully"})
            }
    })
})*/
app.post("/delete/notice",function(req,res){
    var param = req.body
    var editStremObj = {};
    var dQuery = "delete from notice where id = ?"
    var dParams = [param.id];
    mysqladaptor.executeQueryWithParameters(DBNAME,dQuery,dParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Notice Deleted Successfully"})
            }
    })
})
app.post("/get/noticebyid",function(req,res){
    var param = req.body
    var editStremObj = {};
    var dQuery = "select * from notice where id = ?"
    var dParams = [param.id];
    mysqladaptor.executeQueryWithParameters(DBNAME,dQuery,dParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json(result)
            }
    })
})

//================================================================================

app.post("/save/ecxercise",function(req,res){
    
    var param = req.body
    console.log(param)
    var exerciseData = {};
    exerciseData.class_id = param.class_id;
    exerciseData.title = param.title;
    exerciseData.description = param.description;
    exerciseData.notice_date = param.notice_date;
    exerciseData.year_id = param.year_id;
    exerciseData.division_id = param.division_id;
    mysqladaptor.insert(DBNAME,exerciseData,"exercise",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Exercise Saved Successfully"})
            }
    })
})

app.post("/get/exercisebyclass",function(req,res){
    var query = "select * from exersice where class_id = ?"
    var param = req.body;
    var queryParams = [param.user_id]
    mysqladaptor.executeQueryWithParameters(DBNAME,query,queryParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json(result)
            }
    })
})

/*
app.post("/edit/notice",function(req,res){
    var param = req.body
    var editDivisionObj = {};
    //resetP.student_mobile = param.student_mobile;
    editDivisionObj.division_name = param.category_name;
    var where = {"id":param.id}
    mysqladaptor.update(DBNAME,where,editDivisionObj,"division",function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Category Updated Successfully"})
            }
    })
})*/
app.post("/delete/exercise",function(req,res){
    var param = req.body
    var editStremObj = {};
    var dQuery = "delete from notice where id = ?"
    var dParams = [param.id];
    mysqladaptor.executeQueryWithParameters(DBNAME,dQuery,dParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json({"message":"Devision Deleted Successfully"})
            }
    })
})
app.post("/get/noticebyid",function(req,res){
    var param = req.body
    var editStremObj = {};
    var dQuery = "select * from notice where id = ?"
    var dParams = [param.id];
    mysqladaptor.executeQueryWithParameters(DBNAME,dQuery,dParams,function(error,result){
        if(error){
            res.status(500).json({"error":error,"message":"Interval Server Error"})
            return
        }
        if(result){
               res.json(result)
            }
    })
})


app.listen(9112,"192.168.0.101", function() {
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