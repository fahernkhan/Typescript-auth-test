import dotenv from 'dotenv';
dotenv.config();
import jwt from "jsonwebtoken"
import { transport } from "../middlewares/sendMail"
import {
    signupSchema,
    signinSchema,
    acceptCodeSchema,
    changePasswordSchema,
    acceptFPCodeSchema }
from '../middlewares/validator'
import User from '../models/usersModel'
import { doHash, doHashValidation, hmacProcess } from '../utils/hashing'
import { Request, Response, RequestHandler } from 'express';

export const signup = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const { error, value } = signupSchema.validate({ email, password });

        if (error) {
            res.status(401).json({ success: false, message: error.details[0].message });
            return; // Exit early
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(401).json({ success: false, message: 'User already exists!' });
            return; // Exit early
        }

        const hashedPassword = await doHash(password, 12);

        const newUser = new User({
            email,
            password: hashedPassword,
        });

        const result = await newUser.save();

        // Convert model to plain object and remove password
        const userObject = result.toObject() as { email: string; password?: string };

        if (userObject.password) {
            delete userObject.password;
        }

        res.status(201).json({
            success: true,
            message: 'Your account has been created successfully',
            result: userObject,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const tokenSecret = process.env.TOKEN_SECRET;
if (!tokenSecret) {
    throw new Error('TOKEN_SECRET is not defined in environment variables');
}
export const signin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const { error, value } = signinSchema.validate({ email, password });
        if (error) {
            res.status(401).json({ success: false, message: error.details[0].message });
            return;
        }

        const existingUser = await User.findOne({ email }).select('+password');
        if (!existingUser) {
            res.status(401).json({ success: false, message: 'User does not exists!' });
            return;
        }

        const result = await doHashValidation(password, existingUser.password);
        if (!result) {
            res.status(401).json({ success: false, message: 'Invalid credentials!' });
            return;
        }

        const token = jwt.sign(
            {
                userId: existingUser._id,
                email: existingUser.email,
                verified: existingUser.verified,
            },
            tokenSecret,
            {
                expiresIn: '8h',
            }
        );

        res.cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production',
        }).json({
            success: true,
            token,
            message: 'logged in successfully',
        });
    } catch (error) {
        console.error(error);
        // next(error); //Forward error to error-handling middleware
    }
};

export const signout = async (req: Request, res: Response): Promise<void> => {
    res
        .clearCookie('Authorization')
        .status(200)
        .json({ success: true, message: 'logged out successfully' });
};

// const hmacSecretCode = process.env.HMAC_VERIFICATION_CODE_SECRET;
// if (!hmacSecretCode) {
//     throw new Error('HMAC_VERIFICATION_CODE_SECRET is not defined in environment variables');
// }
export const sendVerificationCode = async (req: Request, res: Response): Promise<void> => {
    const hmacSecretCode = process.env.HMAC_VERIFICATION_CODE_SECRET;
    if (!hmacSecretCode) {
        throw new Error('HMAC_VERIFICATION_CODE_SECRET is not defined in environment variables');
    }
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            res.status(404).json({ success: false, message: 'User does not exists!' });
            return;
        }
        if (existingUser.verified) {
            res.status(400).json({ success: false, message: 'You are already verified!' });
            return;
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'verification code',
            html: '<h1>' + codeValue + '</h1>',
        });

        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(
                codeValue,
                hmacSecretCode
            );
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            await existingUser.save();
            res.status(200).json({ success: true, message: 'Code sent!' });
            return;
        }
        res.status(400).json({ success: false, message: 'Code sent failed!' });
    } catch (error) {
        console.log(error);
    }
};

// const hmacSecretCode = process.env.HMAC_VERIFICATION_CODE_SECRET;
// if (!hmacSecretCode) {
//     throw new Error('HMAC_VERIFICATION_CODE_SECRET is not defined in environment variables');
// }
export const verifyVerificationCode = async (req: Request, res: Response): Promise<void> => {
    //coba misal ditarok di lokal mempengaruhi bisnis apa gak..
    const hmacSecretCode = process.env.HMAC_VERIFICATION_CODE_SECRET;
    if (!hmacSecretCode) {
    throw new Error('HMAC_VERIFICATION_CODE_SECRET is not defined in environment variables');
    }
    const { email, providedCode } = req.body;
    try {
        const { error, value } = acceptCodeSchema.validate({ email, providedCode });
        if (error) {
            res
                .status(401)
                .json({ success: false, message: error.details[0].message });
            return
        }

        const codeValue = providedCode.toString();
        const existingUser = await User.findOne({ email }).select(
            '+verificationCode +verificationCodeValidation'
        );

        if (!existingUser) {
            res
                .status(401)
                .json({ success: false, message: 'User does not exists!' });
            return
        }
        if (existingUser.verified) {
            res
                .status(400)
                .json({ success: false, message: 'you are already verified!' });
            return
        }

        if (
            !existingUser.verificationCode ||
            !existingUser.verificationCodeValidation
        ) {
            res
                .status(400)
                .json({ success: false, message: 'something is wrong with the code!' });
            return
        }

        if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
            res
                .status(400)
                .json({ success: false, message: 'code has been expired!' });
            return
        }

        const hashedCodeValue = hmacProcess(
            codeValue,
            hmacSecretCode
        );

        if (hashedCodeValue === existingUser.verificationCode) {
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            await existingUser.save();
            res
                .status(200)
                .json({ success: true, message: 'your account has been verified!' });
            return
        }
        res
            .status(400)
            .json({ success: false, message: 'unexpected occured!!' });
        return
    } catch (error) {
        console.log(error);
    }
};

// Define the custom user data type that comes from the JWT payload
interface UserPayload {
    userId: string;
    verified: boolean;
}

// Extend the Request interface with the custom user property
interface CustomRequest extends Request {
    user?: UserPayload;  // `user` can be undefined, but should always be UserPayload when set
}
export const changePassword = async (req: CustomRequest, res: Response): Promise<any> => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { userId, verified } = req.user;  // Akses user data dari req.user
    const { oldPassword, newPassword } = req.body;

    if (!verified) {
        return res.status(401).json({ success: false, message: 'You are not verified user!' });
    }

    try {
        const { error, value } = changePasswordSchema.validate({ oldPassword, newPassword });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }

        const existingUser = await User.findOne({ _id: userId }).select('+password');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }

        const result = await doHashValidation(oldPassword, existingUser.password);
        if (!result) {
            return res.status(401).json({ success: false, message: 'Invalid credentials!' });
        }

        const hashedPassword = await doHash(newPassword, 12);
        existingUser.password = hashedPassword;
        await existingUser.save();

        return res.status(200).json({ success: true, message: 'Password updated successfully!' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const sendForgotPasswordCode = async (req: Request, res: Response): Promise<any> => {
    const hmacSecretCode = process.env.HMAC_VERIFICATION_CODE_SECRET;
    if (!hmacSecretCode) {
        throw new Error('HMAC_VERIFICATION_CODE_SECRET is not defined in environment variables');
    }
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res
                .status(404)
                .json({ success: false, message: 'User does not exists!' });
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'Forgot password code',
            html: '<h1>' + codeValue + '</h1>',
        });

        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(
                codeValue,
                hmacSecretCode
            );
            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({ success: true, message: 'Code sent!' });
        }
        res.status(400).json({ success: false, message: 'Code sent failed!' });
    } catch (error) {
        console.log(error);
    }
};

export const verifyForgotPasswordCode = async (req: Request, res: Response): Promise<any> => {
    const hmacSecretCode = process.env.HMAC_VERIFICATION_CODE_SECRET;
    if (!hmacSecretCode) {
        throw new Error('HMAC_VERIFICATION_CODE_SECRET is not defined in environment variables');
    }
    const { email, providedCode, newPassword } = req.body;
    try {
        const { error, value } = acceptFPCodeSchema.validate({
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
        const existingUser = await User.findOne({ email }).select(
            '+forgotPasswordCode +forgotPasswordCodeValidation'
        );

        if (!existingUser) {
            return res
                .status(401)
                .json({ success: false, message: 'User does not exists!' });
        }

        if (
            !existingUser.forgotPasswordCode ||
            !existingUser.forgotPasswordCodeValidation
        ) {
            return res
                .status(400)
                .json({ success: false, message: 'something is wrong with the code!' });
        }

        if (
            Date.now() - existingUser.forgotPasswordCodeValidation >
            5 * 60 * 1000
        ) {
            return res
                .status(400)
                .json({ success: false, message: 'code has been expired!' });
        }

        const hashedCodeValue = hmacProcess(
            codeValue,
            hmacSecretCode
        );

        if (hashedCodeValue === existingUser.forgotPasswordCode) {
            const hashedPassword = await doHash(newPassword, 12);
            existingUser.password = hashedPassword;
            existingUser.forgotPasswordCode = undefined;
            existingUser.forgotPasswordCodeValidation = undefined;
            await existingUser.save();
            return res
                .status(200)
                .json({ success: true, message: 'Password updated!!' });
        }
        return res
            .status(400)
            .json({ success: false, message: 'unexpected occured!!' });
    } catch (error) {
        console.log(error);
    }
};
