const express = require('express')
const cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId


const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
require('dotenv').config();
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7ojlu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()
        const database = client.db('Traventures')
        const spotsCollection = database.collection('tourismSpots')
        const bookingList = database.collection('bookingList')
        
        // Get All Spot Details
        app.get('/spots', async (req, res) => {
            const allSpot = await spotsCollection.find({}).toArray()
            res.send(allSpot)
        })

        // Get Single Spot
        app.get('/spot/:id', async (req, res) => {
            const spotID = req.params.id
            const singleSpot = await spotsCollection.find({_id: ObjectId(spotID)}).toArray()

            res.send(singleSpot[0])
        })


        // Add New Spot
        app.post('/addNewSpot', async (req, res) => {
            const newServiceData = await req.body
            await spotsCollection.insertOne(newServiceData);
            res.json('A new spot has been added')
          })

           // Place Your Booking
        app.post('/placeYourBooking', async (req, res) => {
            const bookingInfo = await req.body
            await bookingList.insertOne(bookingInfo);
            res.json('Booking has been placed!')
          })

           // Get Single User Order List
        app.post('/singleUserOrderList', async (req, res) => {
            const userEmail = await req.body.userEmail
            const singleUserBooking = await bookingList.find({userEmail:userEmail}).toArray();

            res.json(singleUserBooking)
          })

           // Get All User Order List
        app.get('/manageAllBooking', async (req, res) => {
            const allUserBooking = await bookingList.find({}).toArray();
            res.json(allUserBooking)
          })

           // Delete Booking
        app.post('/deleteBooking', async (req, res) => {
            const deleteReqId = await req.body.deleteReqId
            await bookingList.deleteOne({_id:ObjectId(deleteReqId)})

            res.send("Deleted Successfully")
          })

           // Delete Booking
        app.post('/updateStatus', async (req, res) => {
            const status = req.body.status
            const id = req.body.id
            const filter = { _id: ObjectId(id) };
            await bookingList.updateOne(filter, {$set:{status:status}});

            res.send( "Status Updated")
          })

          app.get('/', (req,res) => {
              res.send("Server Running...")
          })

    } finally {

    }
}

run().catch(console.dir)



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})