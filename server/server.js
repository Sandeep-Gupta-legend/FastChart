import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import "dotenv/config";
import http from 'http';

import {connectDB} from './lib/db.js'
import userRouter from './routes/userRoutes.js';

const app=express();
const server = http.createServer(app);

app.use(express.json({limit:"4mb"}));
app.use(cors());
app.use("/api/status",(req,res)=>res.send("server is live"))
app.use("/api/auth",userRouter);

await connectDB();

const PORT=process.env.PORT || 5000;
app.listen(PORT,()=> console.log("Server is running on "+PORT))
