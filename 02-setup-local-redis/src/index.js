import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';


const app = express();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/understanding-redis';

app.get('/redis', async (req, res) => {
    const replay = await redis.ping();
    res.json({redis : replay})
})


app.get('/mongo', async (req, res) => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
    res.json({mongo : "connected", database: mongoose.connection.name})
})

app.listen(3000,() => {
    console.log('Server is running on port 3000');
})