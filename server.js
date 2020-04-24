'use strict'
var arresult=[];
require("dotenv").config();
const express=require("express");
const app=express();
const cors=require("cors");
const superagent=require("superagent");
const pg=require("pg");
const PORT=process.env.PORT
var methodOverride = require('method-override');
app.use(methodOverride('_method'))
const client=new pg.Client(process.env.DATABASE_URL);
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.get("/search",(req,res)=>{
    res.render("pages/search");
})

app.get('/',(req,res)=>{
    let SQL="SELECT * FROM dad;";
    return client.query(SQL)
    .then(result=>{
        console.log(result.rows);
        res.render("pages/index",{dbresult:result.rows});
    })
})

app.post("/result",(req,res)=>{
    var url;
    if(req.body.searchtype === "skills")
    {
        console.log(req.body.searchtype);
        url=`http://www.dnd5eapi.co/api/${req.body.searchtype}/${req.body.searchfeild}`;
        console.log(url);
    }
    var arresult=[];
    superagent.get(url)
    .then(data => {
        let arr = data.body;
    arresult.push(arr);
   let dungondata=arresult.map(value=>{
        let dungon=new Dungon(value);
        return dungon;
    })
    console.log(dungondata);
        res.render('pages/result', { items: dungondata[0]})
    })
   
});
app.delete("/delete/:id",(req,res)=>{
    let SQL="DELETE FROM dad WHERE id=$1";
    let safeValue=[req.params.id];
    return client.query(SQL,safeValue)
    .then(()=>{
        console.log("data has been delted");
        res.redirect("/");
    })
})
app.put("/update/:id",(req,res)=>{
    let {name,description,ablity}=req.body;
    let SQL=`UPDATE dad set name=$2,descreption=$3,abilityscore=$4 WHERE id=$1`;
    let safeValue=[req.params.id,name ,description,ablity];
    return client.query(SQL,safeValue)
    .then(()=>{
        console.log("has been updated");
        res.redirect('/');
    })
})
client.connect()
.then(app.listen(PORT,()=>{
    console.log(`server is running on port${PORT}`);
})
);
app.post("/add",(req,res)=>{
    let {name ,description,ablity}=req.body;
    let SQL="INSERT INTO dad(name,descreption,abilityscore) VALUES($1,$2,$3);";
    let safevalue=[name,description,ablity];
    return client.query(SQL,safevalue)
    .then(()=>{
        console.log("data has been inserted");
        res.redirect("/");
    })
    
})
app.get('/detail/:id',(req,res)=>{
    let SQL="SELECT * FROM dad WHERE id=$1";
    let safeValue=[req.params.id];
    return client.query(SQL,safeValue)
    .then((data)=>{
res.render("pages/detail",{item2:data.rows[0]});
    })
})
app.use("*",(req,res)=>{
    res.status(404).send("page not found");
});
app.use(Error,(req,res)=>{
    res.status(500).send(Error);
})
function Dungon(character)
{
    this.name=character.name;
    this.description=character.desc;
    this.ablity=character.ability_score.name
}