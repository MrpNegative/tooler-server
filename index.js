const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const jwt = require("jsonwebtoken");

// medal ware
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// mongo
const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jvszi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {
  try {
    await client.connect();
    console.log("mongoConnected");
    const toolerCollection = client.db("tooler").collection("tools");
    const orderCollection = client.db("tooler").collection("order");
    const userCollection = client.db("tooler").collection("user");
    const reviewCollection = client.db("tooler").collection("review");
    
    app.get('/tools', async(req, res)=>{
        const result = await toolerCollection.find({}).toArray()
        res.send(result)
    })
    // find by id 
    app.get('/tools/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const result = await toolerCollection.findOne(query);
      res.send(result)
    })
    // update available quantaty 
    app.put('/tools/:id', async(req, res)=>{
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateItem = req?.body;
      console.log(updateItem);
      const option = {upsert: true}
      const updateDoc = {
        $set:{
          available: updateItem?.newAvailable
        }
      }
      const result = await toolerCollection.updateOne(query, updateDoc, option);
      res.send(result)

    })
    // orders 
    app.post('/order', async(req, res)=>{
      const order = req.body;
      const result = await orderCollection.insertOne(order)
      res.send(result)
    })
    // get order 
    app.get('/order', async (req,res)=>{
      const result = await orderCollection.find({}).toArray()
      res.send(result)
    })
    // review 
    app.post('/review', async(req, res)=>{
      const order = req.body;
      const result = await reviewCollection.insertOne(order)
      res.send(result)
    })
    // get review 
    app.get('/review', async (req,res)=>{
      const result = await reviewCollection.find({}).toArray()
      res.send(result)
    })
    // user
    app.put('/users', async(req, res)=>{
      const email = req.params.email;
      const filter = {email: email}
      const option = {upsert: true}
      const updateDoc = {
        $set: user,
      }
      const result = await userCollection.updateOne(filter, updateOne, option)
      res.send(result)
    })
  } finally {
    //lkj
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

