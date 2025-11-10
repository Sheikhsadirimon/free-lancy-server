const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

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

    app.post("/allJobs", async (req, res) => {
      const newJobs = req.body;
      const result = await jobsCollection.insertOne(newJobs);
      res.send(result);
    });

    app.patch("/allJobs/:id", async (req, res) => {
      const id = req.params.id;
      const updatedJobs = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: updatedJobs,
      };
      const result = await jobsCollection.updateOne(query, update);
      res.send(result);
    });

    app.delete("/allJobs/:id", async (req, res) => {
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
