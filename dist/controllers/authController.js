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
exports.verifyForgotPasswordCode = exports.sendForgotPasswordCode = exports.changePassword = exports.verifyVerificationCode = exports.sendVerificationCode = exports.signout = exports.signin = exports.signup = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendMail_1 = require("../middlewares/sendMail");
const validator_1 = require("../middlewares/validator");
const usersModel_1 = __importDefault(require("../models/usersModel"));
const hashing_1 = require("../utils/hashing");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const { error, value } = validator_1.signupSchema.validate({ email, password });
        if (error) {
            res.status(401).json({ success: false, message: error.details[0].message });
            return; // Exit early
        }
        const existingUser = yield usersModel_1.default.findOne({ email });
        if (existingUser) {
            res.status(401).json({ success: false, message: 'User already exists!' });
            return; // Exit early
        }
        const hashedPassword = yield (0, hashing_1.doHash)(password, 12);
        const newUser = new usersModel_1.default({
            email,
            password: hashedPassword,
        });
        const result = yield newUser.save();
        // Convert model to plain object and remove password
        const userObject = result.toObject();
        if (userObject.password) {
            delete userObject.password;
        }
        res.status(201).json({
            success: true,
            message: 'Your account has been created successfully',
            result: userObject,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
exports.signup = signup;
const tokenSecret = process.env.TOKEN_SECRET;
if (!tokenSecret) {
    throw new Error('TOKEN_SECRET is not defined in environment variables');
}
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const { error, value } = validator_1.signinSchema.validate({ email, password });
        if (error) {
            res.status(401).json({ success: false, message: error.details[0].message });
            return;
        }
        const existingUser = yield usersModel_1.default.findOne({ email }).select('+password');
        if (!existingUser) {
            res.status(401).json({ success: false, message: 'User does not exists!' });
            return;
        }
        const result = yield (0, hashing_1.doHashValidation)(password, existingUser.password);
        if (!result) {
            res.status(401).json({ success: false, message: 'Invalid credentials!' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified,
        }, tokenSecret, {
            expiresIn: '8h',
        });
        res.cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production',
        }).json({
            success: true,
            token,
            message: 'logged in successfully',
        });
    }
    catch (error) {
        console.error(error);
        // next(error); //Forward error to error-handling middleware
    }
});
exports.signin = signin;
const signout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res
        .clearCookie('Authorization')
        .status(200)
        .json({ success: true, message: 'logged out successfully' });
});
exports.signout = signout;
// const hmacSecretCode = process.env.HMAC_VERIFICATION_CODE_SECRET;
// if (!hmacSecretCode) {
//     throw new Error('HMAC_VERIFICATION_CODE_SECRET is not defined in environment variables');
// }
const sendVerificationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hmacSecretCode = process.env.HMAC_VERIFICATION_CODE_SECRET;
    if (!hmacSecretCode) {
        throw new Error('HMAC_VERIFICATION_CODE_SECRET is not defined in environment variables');
    }
    const { email } = req.body;
    try {
        const existingUser = yield usersModel_1.default.findOne({ email });
        if (!existingUser) {
            res.status(404).json({ success: false, message: 'User does not exists!' });
            return;
        }
        if (existingUser.verified) {
            res.status(400).json({ success: false, message: 'You are already verified!' });
            return;
        }
        const codeValue = Math.floor(Math.random() * 1000000).toString();
        let info = yield sendMail_1.transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'verification code',
            html: '<h1>' + codeValue + '</h1>',
        });
        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = (0, hashing_1.hmacProcess)(codeValue, hmacSecretCode);
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            yield existingUser.save();
            res.status(200).json({ success: true, message: 'Code sent!' });
            return;
        }
        res.status(400).json({ success: false, message: 'Code sent failed!' });
    }
    catch (error) {
        console.log(error);
    }
});
exports.sendVerificationCode = sendVerificationCode;
// const hmacSecretCode = process.env.HMAC_VERIFICATION_CODE_SECRET;
// if (!hmacSecretCode) {
//     throw new Error('HMAC_VERIFICATION_CODE_SECRET is not defined in environment variables');
// }
const verifyVerificationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //coba misal ditarok di lokal mempengaruhi bisnis apa gak..
    const hmacSecretCode = process.env.HMAC_VERIFICATION_CODE_SECRET;
    if (!hmacSecretCode) {
        throw new Error('HMAC_VERIFICATION_CODE_SECRET is not defined in environment variables');
    }
    const { email, providedCode } = req.body;
    try {
        const { error, value } = validator_1.acceptCodeSchema.validate({ email, providedCode });
        if (error) {
            res
                .status(401)
                .json({ success: false, message: error.details[0].message });
            return;
        }
        const codeValue = providedCode.toString();
        const existingUser = yield usersModel_1.default.findOne({ email }).select('+verificationCode +verificationCodeValidation');
        if (!existingUser) {
            res
                .status(401)
                .json({ success: false, message: 'User does not exists!' });
            return;
        }
        if (existingUser.verified) {
            res
                .status(400)
                .json({ success: false, message: 'you are already verified!' });
            return;
        }
        if (!existingUser.verificationCode ||
            !existingUser.verificationCodeValidation) {
            res
                .status(400)
                .json({ success: false, message: 'something is wrong with the code!' });
            return;
        }
        if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
            res
                .status(400)
                .json({ success: false, message: 'code has been expired!' });
            return;
        }
        const hashedCodeValue = (0, hashing_1.hmacProcess)(codeValue, hmacSecretCode);
        if (hashedCodeValue === existingUser.verificationCode) {
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            yield existingUser.save();
            res
                .status(200)
                .json({ success: true, message: 'your account has been verified!' });
            return;
        }
        res
            .status(400)
            .json({ success: false, message: 'unexpected occured!!' });
        return;
    }
    catch (error) {
        console.log(error);
    }
});
exports.verifyVerificationCode = verifyVerificationCode;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { userId, verified } = req.user; // Akses user data dari req.user
    const { oldPassword, newPassword } = req.body;
    if (!verified) {
        return res.status(401).json({ success: false, message: 'You are not verified user!' });
    }
    try {
        const { error, value } = validator_1.changePasswordSchema.validate({ oldPassword, newPassword });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        const existingUser = yield usersModel_1.default.findOne({ _id: userId }).select('+password');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }
        const result = yield (0, hashing_1.doHashValidation)(oldPassword, existingUser.password);
        if (!result) {
            return res.status(401).json({ success: false, message: 'Invalid credentials!' });
        }
        const hashedPassword = yield (0, hashing_1.doHash)(newPassword, 12);
        existingUser.password = hashedPassword;
        yield existingUser.save();
        return res.status(200).json({ success: true, message: 'Password updated successfully!' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.changePassword = changePassword;
const sendForgotPasswordCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hmacSecretCode = process.env.HMAC_VERIFICATION_CODE_SECRET;
    if (!hmacSecretCode) {
        throw new Error('HMAC_VERIFICATION_CODE_SECRET is not defined in environment variables');
    }
    const { email } = req.body;
    try {
        const existingUser = yield usersModel_1.default.findOne({ email });
        if (!existingUser) {
            return res
                .status(404)
                .json({ success: false, message: 'User does not exists!' });
        }
        const codeValue = Math.floor(Math.random() * 1000000).toString();
        let info = yield sendMail_1.transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'Forgot password code',
            html: '<h1>' + codeValue + '</h1>',
        });
        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = (0, hashing_1.hmacProcess)(codeValue, hmacSecretCode);
            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now();
            yield existingUser.save();
            return res.status(200).json({ success: true, message: 'Code sent!' });
        }
        res.status(400).json({ success: false, message: 'Code sent failed!' });
    }
    catch (error) {
        console.log(error);
    }
});
exports.sendForgotPasswordCode = sendForgotPasswordCode;
const verifyForgotPasswordCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hmacSecretCode = process.env.HMAC_VERIFICATION_CODE_SECRET;
    if (!hmacSecretCode) {
        throw new Error('HMAC_VERIFICATION_CODE_SECRET is not defined in environment variables');
    }
    const { email, providedCode, newPassword } = req.body;
    try {
        const { error, value } = validator_1.acceptFPCodeSchema.validate({
            email,
            providedCode,
            newPassword,
        });
        if (error) {
            return res
                .status(401)
                .json({ success: false, message: error.details[0].message });
        }
        const codeValue = providedCode.toString();
        const existingUser = yield usersModel_1.default.findOne({ email }).select('+forgotPasswordCode +forgotPasswordCodeValidation');
        if (!existingUser) {
            return res
                .status(401)
                .json({ success: false, message: 'User does not exists!' });
        }
        if (!existingUser.forgotPasswordCode ||
            !existingUser.forgotPasswordCodeValidation) {
            return res
                .status(400)
                .json({ success: false, message: 'something is wrong with the code!' });
        }
        if (Date.now() - existingUser.forgotPasswordCodeValidation >
            5 * 60 * 1000) {
            return res
                .status(400)
                .json({ success: false, message: 'code has been expired!' });
        }
        const hashedCodeValue = (0, hashing_1.hmacProcess)(codeValue, hmacSecretCode);
        if (hashedCodeValue === existingUser.forgotPasswordCode) {
            const hashedPassword = yield (0, hashing_1.doHash)(newPassword, 12);
            existingUser.password = hashedPassword;
            existingUser.forgotPasswordCode = undefined;
            existingUser.forgotPasswordCodeValidation = undefined;
            yield existingUser.save();
            return res
                .status(200)
                .json({ success: true, message: 'Password updated!!' });
        }
        return res
            .status(400)
            .json({ success: false, message: 'unexpected occured!!' });
    }
    catch (error) {
        console.log(error);
    }
});
exports.verifyForgotPasswordCode = verifyForgotPasswordCode;
