const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const jwt = require("jsonwebtoken");

// medal ware
app.use(express.json());
app.use(cors());
 
// middle tiear 
const verifyJWT = (req, res, next) => {
  const authH = req.headers.authorization
  if(!authH){
    return res.status(401).send({scam: true})
  }
  const token = authH.split(' ')[1]
  jwt.verify(token, process.env.DB_ACCESS_TOKEN, function(err, decoded){
    if(err){
      return res.status(403).send({scam: true})
    }
    req.decoded = decoded;
    next()
  })
}

// mongo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jvszi.mongodb.net/?retryWrites=true&w=majority`;
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

    app.get("/tools", async (req, res) => {
      const result = await toolerCollection.find({}).toArray();
      res.send(result);
    });
    // find by id
    app.get("/tools/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await toolerCollection.findOne(query);
      res.send(result);
    });
    // update available quantaty
    app.put("/tools/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateItem = req?.body;
      console.log(updateItem);
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          available: updateItem?.newAvailable,
        },
      };
      const result = await toolerCollection.updateOne(query, updateDoc, option);
      res.send(result);
    });
    // orders
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    // get order
    app.get("/order", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.send(result);
    });
    // get orders of one user 
    app.get("/order/query", verifyJWT, async (req, res) => {
      const query = req.query.email
      const filter = {email: query}
      const result = await orderCollection.find(filter).toArray();
      res.send(result);
    });
    // delete order by id
    app.delete("/order/:id",  async (req, res) => {
      const id = req.params.id
      const filter = {_id: ObjectId(id)}
      const result = await orderCollection.deleteOne(filter);
      res.send(result);
    });
    // review
    app.post("/review", async (req, res) => {
      const order = req.body;
      const result = await reviewCollection.insertOne(order);
      res.send(result);
    });
    // get review
    app.get("/review", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.send(result.reverse());
    });
    // user
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      if(email){
        const user = req.body;
      const filter = { email: email };
      const option = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, option);
      const token = jwt.sign({ email: email }, process.env.DB_ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      const fullResult = { result, token };
      res.send(fullResult);
      }
    });
    // get users 
    app.get("/users", verifyJWT, async (req, res) => {;
      const result = await userCollection.find({}).toArray();
      res.send(result);
    });
    // set user role 
    app.put('/users/role/:email', async (req, res)=>{
      const email = req.params.email;
      console.log(email);
      const filter = {email: email}
      const updateDoc = {
        $set: {role: 'admin'}
      }
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result)
    })
    // Delete User
    app.delete('/users/delete/:email', async (req, res)=>{
      const email = req.params.email;
      console.log(email);
      const filter = {email: email}
      const result = await userCollection.deleteOne(filter);
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
