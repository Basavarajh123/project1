const express= require("express");
const {open}= require("sqlite");
const sqlite3 = require("sqlite3");
const axios = require('axios');
const cors= require('cors')

const path = require('path');


const dbPath = path.join(__dirname,"transactions.db");

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



const fetchAndInsert = async () => {
  const response = await axios.get(
    "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
  );
  const data = response.data;
  

  for (let item of data) {
    const queryData = `SELECT id FROM transactions WHERE id = ${item.id}`;
    const existingData = await database.get(queryData);
    if (existingData === undefined) {
      const query = `
   INSERT INTO transactions (id, title, price, description, category, image, sold, dateOfSale) 
   VALUES (
       ${item.id},
       '${item.title.replace(/'/g, "''")}',
       ${item.price},
       '${item.description.replace(/'/g, "''")}',
       '${item.category.replace(/'/g, "''")}',
       '${item.image.replace(/'/g, "''")}',
       ${item.sold},
       '${item.dateOfSale.replace(/'/g, "''")}'
   );
`; /*The .replace(/'/g, "''") in the SQL query helps prevent SQL injection attacks by escaping single quotes.*/

      await database.run(query);
    }
  }
  console.log("Transactions added");
};

fetchAndInsert();


app.get('/tasks/', async(req,res)=>{

  const getAllTasksQuery= `SELECT * FROM transactions`;
  const transactionsData= await database.all(getAllTasksQuery)
  res.send(transactionsData);

app.get('/tasks/:month',async(req,res)=>{
  const {month}= req.params
  const sqlQuery=`SELECT * FROM transactions WHERE CAST(strftime('%m', dateOfSale) AS INTEGER) = ${month}`
  const data= await database.all(sqlQuery);
  res.send(data)
})

})
app.get('/stats/:month/',async(req,res)=>{
  const {month} = req.params;
  const getStatsQuery= `SELECT 
                              SUM(
                                CASE WHEN(sold >0) THEN sold * price END
                              ) AS TotalSale,
                                SUM(sold) AS TotalSoldItems,
                                COUNT(*) AS TotalItems

                               FROM 
                               transactions 
                               WHERE   CAST(strftime('%m', dateOfSale) AS INTEGER) = ${month}`

                               const data = await database.get(getStatsQuery)
                               res.send(data)
})


app.get('/transactions/barchart/:month/',async(req,res)=>{
  const {month}= req.params;
  const sqlQuery= `SELECT COUNT( CASE WHEN (price <= 100 and price >= 0) THEN 1 END) AS range_1_to_100,
                    COUNT( CASE WHEN (price <= 200 and price > 100) THEN 1 END) AS range_101_to_200,
                    COUNT( CASE WHEN (price <= 300 and price > 200) THEN 1 END) AS range_201_to_300,
                    COUNT( CASE WHEN (price <= 400 and price > 300) THEN 1 END) AS range_301_to_400,
                    COUNT( CASE WHEN (price <= 500 and price > 400) THEN 1 END) AS range_401_to_500,
                    COUNT( CASE WHEN (price <= 600 and price > 500) THEN 1 END) AS range_501_to_600,
                    COUNT( CASE WHEN (price <= 700 and price > 600) THEN 1 END) AS range_601_to_700,
                    COUNT( CASE WHEN (price <= 800 and price > 700) THEN 1 END) AS range_701_to_800,
                    COUNT( CASE WHEN (price <= 900 and price > 800) THEN 1 END) AS range_801_to_900,
                    COUNT( CASE WHEN ( price > 900) THEN 1 END) AS range_901_and_above

  
  
  
  
  FROM transactions WHERE CAST(strftime('%m', dateOfSale) AS INTEGER) = ${month}`;
  const data = await database.all(sqlQuery);
  res.send(data)
})

app.get('/transactions/piechart/:categoryId/:month/',async(req,res)=>{
  const {categoryId,month}= req.params;
  const sqlQueryForPieChart=`SELECT COUNT(*) AS Number_Of_Items FROM transactions WHERE category LIKE "${categoryId}" AND CAST(strftime('%m', dateOfSale) AS INTEGER) = ${month};`;

const data = await database.all(sqlQueryForPieChart);
res.send(data)
})


module.exports = app;