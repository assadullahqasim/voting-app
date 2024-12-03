import mongoose from 'mongoose'

const connectUrl = process.env.MONGODB_URL_LOCAL;

mongoose.connect(connectUrl)
.then(()=>{
    console.log("Database connection established");
})
.catch((error)=>{
    console.error('Database connection error:', error);
})

const db = mongoose.connection;

db.on('connected',()=>{
    console.log('Connected to MongoDB server');
})

db.on('error',(err)=>{
    console.log('MongoDB connection error: ',err);
})

db.on('disconnected',()=>{
    console.log('MongoDB disconnected');
})

export default db