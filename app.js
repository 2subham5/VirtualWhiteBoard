//require all the modules used 
const express= require("express");
const bodyParser= require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const https= require("https");

// create an express app
const app= new express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended:true
}));
app.use(session({
  secret: "this is white board",
  resave: false,
  saveUninitialized: true,

}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://whiteBoard:Askmelater@cluster0.muhlp0p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // family: 4,
});

const boardSchema = new mongoose.Schema({
  email:String,
  password: String
});

const Board =  mongoose.model("Board", boardSchema);
app.get("/",function(req,res){
    res.render("index");
})

app.get("/home",function(req,res){
  res.render("home")
})

app.get("/signup",function(req,res){
  res.render("signup");
});
app.get("/login",function(req,res){
  res.render("login");
});

app.post("/signup",async function(req,res){
 
    // Store hash in your password DB.
    try{
      const foundUser = await Board.findOne({  email: req.body.email });
      if(foundUser){
        res.render("login", { message: "User already exists! Please log in." });   
      }
      else{
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new Board({
          email: req.body.email,
          password: hash
        });
        newUser.save().then(function(id){
          console.log(id+"\nuser signup successful");
          res.redirect("/login");
          
        }).catch(function (err){
          console.log(err);
        });
          
      });
    }
  }
    catch(err){
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }    
});
  
app.post("/login", async function(req,res){
  const email = req.body.email;
  const password = req.body.password;

try{ 
  const foundUser = await Board.findOne({  email: email });
  if(foundUser){
    //if the user is found, compare the password entered.
    const isPasswordMatch = await bcrypt.compare(password, foundUser.password);
    if(isPasswordMatch){
      res.redirect("/home")
    }
    else{
      //if the password entered is incorrect, redirect with a message.
      res.render('login',{message:"Password entered is incorrect! Please try again."})
    }
  }
  else{
    //if the user is not found, render login page with a message to enter password again
    res.render('login',{message :"Invalid login id. Please try again, or sign up!"});
  }
}
   catch(err){
    console.log(err);
    res.status(500).json({ message: "Server error" });
   }


})



app.listen(3000,function(){
    console.log("Server started at port 3000");
})
