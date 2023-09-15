const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const { subscribe } = require("diagnostics_channel");

// database connection
mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"backend",

}).then(()=>console.log("Dtabase connected"))
.catch((e)=>console.log(e));

const messageSchema = new mongoose.Schema({
    name:String,
    email:String
})

const Message = mongoose.model("Messages",messageSchema);

app.get("/add",async (req,res)=>{
   await Message.create({name:"Jigar2",email:"janvi2@gmail.com"})
        res.send("Nice");
     
    
})


app.use(express.json());

const users =[];

app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:true}));
// console.log(path.join(path.resolve(),"public"));

app.set("view engine","ejs");


app.get("/",(req,res) => {
    res.render("index",{name : "Singh"});
})

app.get("/sucess",(req,res)=>{
    res.send("Succesfully submitted");
})

app.post("/",(req,res)=>{
   Message.create({name:req.body.name,email:req.body.email});
    res.redirect("/sucsess");
})

app.get("/users",(req,res) =>{
    res.json({
        users,
    });
})


app.listen(3000,()=>{
    console.log("server created successfully");
})