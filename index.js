const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleWire
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.27tlm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        console.log('connected to database');
        const database = client.db('handiCraft-jwellery');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');

        //.................product...............................
        // insert one product...............
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        });
        // //get all products..............
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });
        // //get one product...............
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        });
        // //update product.................
        app.put('/products/update/:id', async (req, res) => {
            const id = req.params.id;
            const updatePackage = req.body;
            // console.log(updatePackage);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    img: updatePackage.img,
                    name: updatePackage.name,
                    description: updatePackage.description,
                    price: updatePackage.price,
                    duration: updatePackage.duration,
                },
            };
            const result = await productsCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        // //delete one Product..............
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        });

        // //.................Order....................................
        // //insert one order  (placeOrder)
        app.post('/placeOrder', async (req, res) => {
            const order = req.body;
            // console.log('hit the post api', order);
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        });
        // //get All Orders...............
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });
        // //get All Orders of an user...............
        app.get('/orders/:email', async (req, res) => {
            const user = req.params;
            const query = { email: user.email }
            const cursor = ordersCollection.find(query);
            const result = await cursor.toArray();
            res.json(result);
        });
        // //delete one order..............
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });


        // //..............................review...............................
        // // insert one review.............
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        });
        // //get All Reviews...............
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });



        // //........................user......................................
        // //user insert for email..............
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });
        // //user insert (upsert) for google............
        app.put('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(query, updateDoc, options);
            res.json(result);
        });
        // //user make admin..................
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const query = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(query, updateDoc);
            // console.log(result);
            res.json(result);
        });
        // //check admin retrun bool value
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });





    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running handCraft-jwellery server');
});

app.listen(port, () => {
    console.log('running port ', port)
})
