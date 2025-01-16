import dotenv from 'dotenv';
dotenv.config();

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'

import authRouter from './routers/authRouter'
import postsRouter from './routers/postsRouter'

const app = express();
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => {
        console.log('Database connected');
    })
    .catch((error: Error) => {
        console.log(error.message);
    });

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.get('/', (req, res) => {
    res.json({ message: 'Hello from the server' });
});

app.listen(process.env.PORT, () => {
    console.log('listening...');
});