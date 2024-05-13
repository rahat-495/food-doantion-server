
const { MongoClient, ServerApiVersion, Db, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express() ;
const port = process.env.PORT || 5555 ;

app.use(cors()) ;
app.use(express.json()) ;
require('dotenv').config() ;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w0yjihf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const featuredFoodsCollection = client.db('assignment11').collection('foodsCollection') ;

    app.get('/featuredFoods' , async (req , res) => {
      const cursor = featuredFoodsCollection.find().sort({foodQuantity : -1}) ;
      const result = await cursor.toArray() ;
      res.send(result) ;
    })

    app.get('/featuredFoods/:id' , async (req , res) => {
      const id = req.params.id ;
      const query = {_id : new ObjectId(id)} ;
      const result = await featuredFoodsCollection.findOne(query) ;
      res.send(result) ;
    })

    app.get('/remainingFoods/:id' , async (req , res) => {
      const id = req.params.id ;
      const query = {_id : new ObjectId(id)} ;
      const result = await featuredFoodsCollection.findOne(query) ;
      res.send(result) ;
    })

    app.get('/availbleFoods' , async (req , res) => {
      const sort = req.query.sort ;
      const search = req.query.search ;
      
      let options = {} ;
      let query = {} ;

      if(sort) options = { sort : {expiredDateTime : sort === 'asc' ? 1 : -1} }
      if(search) query = {foodName : {$regex : search , $options : 'i'}}
      const filter = {status : 'available'} ;

      const cursor = featuredFoodsCollection.find({...query , ...filter} , options) ;
      const result = await cursor.toArray() ;
      res.send(result) ;
    })

    app.get('/manageMyFoods/:email' , async (req , res) => {
      const email = req.params.email ;
      const filter = {"donator.donatorEmail" : email} ;
      const cursor = featuredFoodsCollection.find(filter) ;
      const result = await cursor.toArray() ;
      res.send(result) ;
    })

    app.get('/myRequestedFoods/:email' , async (req , res) => {
      const email = req.params.email ;
      const filter = {email : email} ;
      const cursor = featuredFoodsCollection.find(filter) ;
      const result = await cursor.toArray() ;
      res.send(result) ;
    })
 
    app.post('/addFood' , async (req , res) => {
      const postedItem = req.body ;
      const result = await featuredFoodsCollection.insertOne(postedItem) ;
      res.send(result) ;
    })

    app.patch('/foodsRequest/:id' , async (req , res) => {
      const id = req.params.id ;
      const {additional , status , email , requestedDate} = req.body ;
      const filter = {_id : new ObjectId(id)} ;
      const updateDoc = {
        $set:{
          additionalNotes : additional ,
          status : status ,
          email : email ,
          requestedDate : requestedDate ,
        }
      }
      const result = await featuredFoodsCollection.updateOne(filter , updateDoc) ;
      res.send(result) ;
    })

    app.put('/updateFood/:id' , async (req , res) => {
      const id = req.params.id ;
      const updatedFood = req.body ;

      const filter = {_id : new ObjectId(id)} ;
      const options = { upsert: true };
      const updateDoc = {
        $set : {
          foodImage : updatedFood.foodImage,
          foodName : updatedFood.foodName,
          donator : {
            donatorImage : updatedFood.donator.donatorImage,
            donatorName : updatedFood.donator.donatorName,
            donatorEmail : updatedFood.donator.donatorEmail,
          },
          foodQuantity : updatedFood.foodQuantity,
          pickupLocation : updatedFood.pickupLocation,
          expiredDateTime : updatedFood.expiredDateTime,
          additionalNotes : updatedFood.additionalNotes,
          status : updatedFood.status,
        }
      }
      
      const result = await featuredFoodsCollection.updateOne(filter , updateDoc , options) ;
      res.send(result) ;
    })

    app.delete('/foodDelete/:id' , async (req , res) => {
      const id = req.params.id ;
      const filter = {_id : new ObjectId(id)} ;
      const result = await featuredFoodsCollection.deleteOne(filter) ;
      res.send(result) ;
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/' , (req , res) => {
    res.send("The food sharing server is running !")
})

app.listen(port , () => {
    console.log(`the server is running at port : ${port}`);
})
