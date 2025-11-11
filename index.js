const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

const admin = require("firebase-admin");

const serviceAccount = require("./free-lancy-firebase-admin-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


// middleware
app.use(cors());
app.use(express.json());

const verifyFireBaseToken = async (req,res,next)=>{
    const authorization = req.headers.authorization
    if(!authorization){
      return res.status(401).send({message: 'unauthorized access'})
    }
    const token = authorization.split(' ')[1];
      try{
          const decoded = await admin.auth().verifyIdToken(token)
          req.token_email = decoded.email
          next()
      }
      catch(error){
        return res.status(401).send({message: 'unauthorized access'})
      }

}

const uri =
  "mongodb+srv://freelancydbUser:cB7afRJME2Y2yCIn@clusterpro.d9ffs3x.mongodb.net/?appName=ClusterPro";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("server is running");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("freelancy_db");
    const jobsCollection = db.collection("jobs");

    app.get("/jobs", async (req, res) => {
        console.log(req.query)
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }

      const cursor = jobsCollection.find(query).sort({ _id: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    app.post("/jobs", verifyFireBaseToken, async (req, res) => {
      // console.log('headers in the post', req.headers)
      const newJobs = {...req.body, postedAt: new Date()};
      const result = await jobsCollection.insertOne(newJobs);
      res.send(result);
    });

    app.patch("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const updatedJobs = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: updatedJobs,
      };
      const result = await jobsCollection.updateOne(query, update);
      res.send(result);
    });

    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
