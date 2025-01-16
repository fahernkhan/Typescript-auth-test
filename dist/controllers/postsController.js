"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.createPost = exports.singlePost = exports.getPosts = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { createPostSchema } = require('../middlewares/validator');
const postsModel_1 = __importDefault(require("../models/postsModel"));
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postsPerPage = 10;
    try {
        // Parsing `page` dengan default nilai 1 jika tidak ada
        const page = parseInt(req.query.page, 10) || 1;
        // Pastikan `page` tidak kurang dari 1
        const pageNum = Math.max(page - 1, 0);
        // Query posts dengan pagination
        const result = yield postsModel_1.default.find()
            .sort({ createdAt: -1 })
            .skip(pageNum * postsPerPage)
            .limit(postsPerPage)
            .populate({
            path: 'userId',
            select: 'email',
        });
        // Kirim response dengan data
        res.status(200).json({ success: true, message: 'posts', data: result });
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.getPosts = getPosts;
const singlePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.query;
    try {
        const existingPost = yield postsModel_1.default.findOne({ _id }).populate({
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
    }
    catch (error) {
        console.log(error);
    }
});
exports.singlePost = singlePost;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, description } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
        const result = yield postsModel_1.default.create({
            title,
            description,
            userId,
        });
        res.status(201).json({ success: true, message: 'created', data: result });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.createPost = createPost;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.query; // Mengambil _id dari query params
    const { title, description } = req.body; // Mengambil data title dan description dari request body
    const { userId } = req.user; // Mendapatkan userId dari req.user yang ada di CustomRequest
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
        const existingPost = yield postsModel_1.default.findOne({ _id });
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
        const result = yield existingPost.save(); // Menyimpan perubahan ke database
        res.status(200).json({ success: true, message: 'Updated', data: result });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.updatePost = updatePost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { _id } = req.query;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const existingPost = yield postsModel_1.default.findOne({ _id });
        if (!existingPost) {
            return res
                .status(404)
                .json({ success: false, message: 'Post already unavailable' });
        }
        if (existingPost.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        yield postsModel_1.default.deleteOne({ _id });
        res.status(200).json({ success: true, message: 'deleted' });
    }
    catch (error) {
        console.log(error);
    }
});
exports.deletePost = deletePost;
