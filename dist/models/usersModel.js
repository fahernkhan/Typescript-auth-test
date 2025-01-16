"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: [true, 'Email is required!'],
        trim: true,
        unique: [true, 'Email must be unique!'],
        minLength: [5, 'Email must have 5 characters!'],
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Password must be provided!'],
        trim: true,
        select: false,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
        select: false,
    },
    verificationCodeValidation: {
        type: Number,
        select: false,
    },
    forgotPasswordCode: {
        type: String,
        select: false,
    },
    forgotPasswordCodeValidation: {
        type: Number,
        select: false,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('User', userSchema);
//module.exports = mongoose.model('User', userSchema);
