import Redis from 'ioredis';
import express from 'express';

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const EMAIL_QUEUE_KEY = "queue:emails";


app.post('/emails', async (req, res) => {
    const job = {
        to : req.body.to,
        subject : req.body.subject || "No Subject",
        body : req.body.body || "No Body",
        crereatedAt : new Date().toISOString()
    }
    await redis.lpush(EMAIL_QUEUE_KEY, JSON.stringify(job));
    res.json({queued:true,job})
});

app.get('/emails/process-one', async (req, res)=>{
    const rawJob = await redis.rpop(EMAIL_QUEUE_KEY);
    if(!rawJob){
        return res.json({job:null, message:"No job in the queue"})
    }
    const job = JSON.parse(rawJob);
    res.json({message:'Email Sent', job})
});

app.listen(3000,() => {
    console.log('Server is running on port 3000');
})