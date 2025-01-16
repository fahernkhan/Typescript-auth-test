import dotenv from 'dotenv';
dotenv.config();

import User from '../models/usersModel'
import { Request, Response, RequestHandler } from 'express';
const { createPostSchema } = require('../middlewares/validator');
import Post from '../models/postsModel'

export const getPosts = async (req: Request, res: Response): Promise<void> => {
    const postsPerPage = 10;

    try {
        // Parsing `page` dengan default nilai 1 jika tidak ada
        const page = parseInt(req.query.page as string, 10) || 1;

        // Pastikan `page` tidak kurang dari 1
        const pageNum = Math.max(page - 1, 0);

        // Query posts dengan pagination
        const result = await Post.find()
            .sort({ createdAt: -1 })
            .skip(pageNum * postsPerPage)
            .limit(postsPerPage)
            .populate({
                path: 'userId',
                select: 'email',
            });

        // Kirim response dengan data
        res.status(200).json({ success: true, message: 'posts', data: result });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const singlePost = async (req: Request, res: Response): Promise<any> => {
    const { _id } = req.query;

    try {
        const existingPost = await Post.findOne({ _id }).populate({
            path: 'userId',
            select: 'email',
        });
        if (!existingPost) {
            return res
                .status(404)
                .json({ success: false, message: 'Post unavailable' });
        }
        res
            .status(200)
            .json({ success: true, message: 'single post', data: existingPost });
    } catch (error) {
        console.log(error);
    }
};

interface CustomRequest extends Request {
    user?: {
        userId: string;
    };
}
export const createPost = async (req: CustomRequest, res: Response): Promise<any> => {
    const { title, description } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const { error, value } = createPostSchema.validate({
            title,
            description,
            userId,
        });
        if (error) {
            return res
                .status(401)
                .json({ success: false, message: error.details[0].message });
        }

        const result = await Post.create({
            title,
            description,
            userId,
        });
        res.status(201).json({ success: true, message: 'created', data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updatePost = async (req: CustomRequest, res: Response): Promise<any> => {
    const { _id } = req.query;  // Mengambil _id dari query params
    const { title, description } = req.body;  // Mengambil data title dan description dari request body
    const { userId } = req.user!;  // Mendapatkan userId dari req.user yang ada di CustomRequest

    try {
        // Validasi input menggunakan createPostSchema
        const { error, value } = createPostSchema.validate({
            title,
            description,
            userId,
        });

        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }

        // Mencari post berdasarkan _id
        const existingPost = await Post.findOne({ _id });

        if (!existingPost) {
            return res.status(404).json({ success: false, message: 'Post unavailable' });
        }

        // Memastikan bahwa hanya user yang membuat post yang bisa mengeditnya bandingkan dengan userId yang di interface
        if (existingPost.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Memperbarui post
        existingPost.title = title;
        existingPost.description = description;

        const result = await existingPost.save();  // Menyimpan perubahan ke database
        res.status(200).json({ success: true, message: 'Updated', data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const deletePost = async (req: CustomRequest, res: Response): Promise<any> => {
    const { _id } = req.query;
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const existingPost = await Post.findOne({ _id });
        if (!existingPost) {
            return res
                .status(404)
                .json({ success: false, message: 'Post already unavailable' });
        }
        if (existingPost.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await Post.deleteOne({ _id });
        res.status(200).json({ success: true, message: 'deleted' });
    } catch (error) {
        console.log(error);
    }
};
