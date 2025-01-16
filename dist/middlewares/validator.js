"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostSchema = exports.acceptFPCodeSchema = exports.changePasswordSchema = exports.acceptCodeSchema = exports.signinSchema = exports.signupSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.signupSchema = joi_1.default.object({
    email: joi_1.default.string()
        .min(6)
        .max(60)
        .required()
        .email({
        tlds: { allow: ['com', 'net'] },
    }),
    password: joi_1.default.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
});
exports.signinSchema = joi_1.default.object({
    email: joi_1.default.string()
        .min(6)
        .max(60)
        .required()
        .email({
        tlds: { allow: ['com', 'net'] },
    }),
    password: joi_1.default.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
});
exports.acceptCodeSchema = joi_1.default.object({
    email: joi_1.default.string()
        .min(6)
        .max(60)
        .required()
        .email({
        tlds: { allow: ['com', 'net'] },
    }),
    providedCode: joi_1.default.number().required(),
});
exports.changePasswordSchema = joi_1.default.object({
    newPassword: joi_1.default.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
    oldPassword: joi_1.default.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
});
exports.acceptFPCodeSchema = joi_1.default.object({
    email: joi_1.default.string()
        .min(6)
        .max(60)
        .required()
        .email({
        tlds: { allow: ['com', 'net'] },
    }),
    providedCode: joi_1.default.number().required(),
    newPassword: joi_1.default.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
});
exports.createPostSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).max(60).required(),
    description: joi_1.default.string().min(3).max(600).required(),
    userId: joi_1.default.string().required(),
});
