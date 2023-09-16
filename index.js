const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
// const { subscribe } = require("diagnostics_channel");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const ejs = require("ejs");

const bcrypt = require("bcrypt");
// database connection
mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"backend",

}).then(()=>console.log("Dtabase connected"))
.catch((e)=>console.log(e));

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
})

const User = mongoose.model("User",userSchema);




app.use(express.json());



app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
// console.log(path.join(path.resolve(),"public"));

app.set("view engine","ejs");


const isAuthenticated = async (req,res,next) => {
    const {token} = req.cookies;
    if(token){
        const decoded = jwt.verify(token,"buuavvc");
        console.log(decoded);
        req.user = await User.findById(decoded._id);
        console.log(req.user);

        next();
    }
    else{
        res.redirect("/login");
    }
};


app.get("/",isAuthenticated,(req,res) => {
    console.log(req.user);
    res.render("logout",{name:req.user.name});
})

app.get("/login",(req,res)=>{
    res.render("login");
})

app.get("/register",(req,res) => {
    console.log(req.user);
    res.render("register");
})

app.post("/login",async (req,res)=>{
    const {email,password} = req.body;

    let user = await User.findOne({email});
    if(!user) return res.redirect("/register");

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) return res.render("login",{email,message:"Incorrect Password"});

    const token = jwt.sign({_id:user._id},"buuavvc");
    

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)

    });
    res.redirect("/");

    
})


app.post("/register",async (req,res)=>{
    const {name,email,password} =req.body;

    let user = await User.findOne({email});
    if(user){
        return res.redirect("/login");

    }

    const hashedPassword = await bcrypt.hash(password,10);

     user = await User.create({
        name,
        email,
        password:hashedPassword,
    })

    // creating jsonwebtoken
    const token = jwt.sign({_id:user._id},"buuavvc");
    

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)

    });
    res.redirect("/");

})

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now())

    });
    res.redirect("/");

})




app.listen(3000,()=>{
    console.log("server created successfully");
})