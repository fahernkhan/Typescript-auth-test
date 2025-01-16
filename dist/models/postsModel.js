"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: [true, 'title is required!'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'description is required!'],
        trim: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model('Post', postSchema); // yang depan alias yang sampignya ori
