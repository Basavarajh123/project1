const express= require("express");
const {open}= require("sqlite");
const sqlite3 = require("sqlite3");
const  cors= require("cors");

const path = require('path');


const dbPath = path.join(__dirname,"User.db");

const app= express();

app.use(express.json());
app.use(cors());
let database=null;


const initializationDbAndServer =async()=>{

    try{
        database= await open({
            filename:dbPath,
            driver:sqlite3.Database
        })

        app.listen(4000,()=>{
            console.log("Listening at Port http://localhost:4000");
        })
    }catch(error){
        console.log(`DB error :${error}`);
    }


}

initializationDbAndServer()

app.get('/',(req,res)=>{
    res.send('Welcome Backend App');
})

app.get('/users',async(req,res)=>{
    const sqlQuery=`SELECT * FROM User`
    const data =await database.all(sqlQuery);
    res.send(data);
})

app.post("/signup",async(req,res)=>{

    const{name,email,password}= req.body;
   
    const userQuery=`INSERT INTO User(name,email,password)
                    VALUES("${name}","${email}","${password}");
    `
    await database.run(userQuery);
    res.send('User Added to database in Application');
    
})

app.post("/login",async(req,res)=>{
    const {email,password}= req.body;
    const userQuery =`SELECT * FROM User WHERE email="${email}" AND password="${password}";`;
    const data = await database.get(userQuery);
    res.send('Login Successfully');
})


module.exports = app;