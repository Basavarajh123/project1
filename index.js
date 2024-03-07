const express= require("express");
const {open}= require("sqlite");
const sqlite3 = require("sqlite3");
const  cors= require("cors");
const bcryp = require("bcrypt");
const path = require('path');


const dbPath = path.join(__dirname,"User.db");

const app= express();
app.use(cors());

app.use(express.json());

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

app.get('/',(request,response)=>{
    response.send('Welcome Backend App');
})

app.get('/user/',async(request,response)=>{
    const sqlQuery=`SELECT * FROM User`
    const data =await database.all(sqlQuery);
    response.send(data);
})

app.post("/signup/",async(request,response)=>{

    const{name,email,password}= request.body;
   
    const userQuery=`INSERT INTO User(name,email,password)
                    VALUES("${name}","${email}","${password}");
    `
    await database.run(userQuery);
    res.send('User Added to database in Application');
    
})

app.post("/login",async(request,response)=>{
    const {email,password}= request.body;
    const userQuery =`SELECT * FROM User WHERE email="${email}" AND password="${password}";`;
    await database.get(userQuery);
    response.send('Login Successfully');
})



app.post("/users/", async (request, response) => {
    const { name, email} = request.body;
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    const selectUserQuery = `SELECT * FROM user WHERE email = '${email}'`;
    const dbUser = await db.get(selectUserQuery);
    if (dbUser === undefined) {
      const createUserQuery = `
        INSERT INTO 
          user (username, name, password, gender, location) 
        VALUES 
          (
            
            '${name}',
            '${email}',
            '${hashedPassword}'
            
          )`;
      const dbResponse = await db.run(createUserQuery);
      const newUserId = dbResponse.lastID;
      response.send(`Created new user with ${newUserId}`);
    } else {
      response.status = 400;
      response.send("User already exists");
    }
  });


app.post("/login", async (request, response) => {
    const { name, password } = request.body;
    const selectUserQuery = `SELECT * FROM user WHERE username = '${name}'`;
    const dbUser = await db.get(selectUserQuery);
    if (dbUser === undefined) {
      response.status(400);
      response.send("Invalid User");
    } else {
      const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
      if (isPasswordMatched === true) {
        response.send("Login Success!");
      } else {
        response.status(400);
        response.send("Invalid Password");
      }
    }
  });

module.exports = app;