//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
const port = process.env.PORT || 3000;
const url = "mongodb://localhost:27017/userDB";

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(function () {
    console.log("connect to database");
  });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//plugin
const secretKey = process.env.SECRET_KEY;
userSchema.plugin(encrypt,{secret: secretKey, encryptedFields:["password"]});

const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/secrets", function(req,res){
    res.render("secrets");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });
  newUser.save(function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect("/secrets")
    }
  });
});

app.post("/login", function (req, res) {
  User.findOne({ email: req.body.username }, function (err, userFound) {
    if (err) {
      console.log(err);
      res.redirect("/login");
    } else {
      if (!userFound) {
        res.redirect("/login");
      } else {
        if (userFound.password === req.body.password) {
          res.redirect("/secrets");
        } else {
          res.redirect("/login");
        }
      }
    }
  });
});

app.listen(port, function () {
  console.log("server is running on port" + port);
});
