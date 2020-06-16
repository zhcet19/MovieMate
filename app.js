var express= require("express")
var mongoose= require("mongoose")
var passport= require("passport")
var bodyParser= require("body-parser")
var User= require("./models/user")
var flash= require("connect-flash");
const request = require('request');
var LocalStrategy= require("passport-local")
var passportLocalMongoose= require("passport-local-mongoose")
//mongodb://localhost:27017/auth_demo_app
var app= express();

app.set("view engine","ejs");
app.use(express.static(__dirname +"/public"));
app.use(flash());
mongoose.connect('mongodb+srv://faizamu:<faizamu@19>@cluster2-pc71z.mongodb.net/<dbname>?retryWrites=true&w=majority');
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")(
	{
		secret:"i am not a lier",
		resave:false,
		saveUninitialized:false
	}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.get("/",function(req,res){
	res.render("landing");
});
app.get("/index",function(req,res){
	console.log(req.user);
	res.render("index",{currentUser:req.user});
})
app.get("/search",isLoggedIn,function(req, res){
	
   res.render("search");
});

app.get("/results", function(req, res){
    var query = req.query.search;
	var year=req.query.year;
    var url = "http://omdbapi.com/?t="+ query +"&y="+year+"&apikey=thewdb";
    request(url, function(error, response, body){
        if(!error && response.statusCode == 200) {
            var data = JSON.parse(body)
			console.log(data)
            res.render("results", {data: data});
        }
    });
});
app.get("/register",function(req,res){
	res.render("register");
});

app.post("/register",function(req,res){
    req.body.username
	req.body.password
	User.register(new User({username: req.body.username}),req.body.password,function(err,user){
	if(err)
	{
				req.flash("error",err.message)
				 res.render("register");
		}
	passport.authenticate("local")(req,res,function(){
		   req.flash("success" , "welcome to Moviemate " + user.username);
			res.redirect("/index");
		});
	});
});

app.get("/login",function(req,res){
	res.render("login");
})
app.post("/login",passport.authenticate("local",{
		successRedirect:"/index",
		failureRedirect:"/login"
}),function(req,res){});
app.get("/logout",function(req,res)
	   {
	req.logout();
	req.flash("success","You logged out successfully")
	res.redirect("/index");
});
function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
		{
			return next();
		}
	else{
		req.flash("error","please login first")
		res.redirect("/login");
	}
}
app.listen(3000,function()
		  {
	console.log("server is listening");
});		
		
		
		