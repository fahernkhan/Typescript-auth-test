import express from 'express';
import {
    signup,
    signin,
    signout,
    sendVerificationCode,
    verifyVerificationCode,
    changePassword,
    verifyForgotPasswordCode,
    sendForgotPasswordCode}
from '../controllers/authController';
import { identifier } from "../middlewares/identification";

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', identifier, signout);

router.patch('/send-verification-code', identifier,sendVerificationCode);
router.patch('/verify-verification-code', identifier, verifyVerificationCode);
router.patch('/change-password', identifier, changePassword);
router.patch('/send-forgot-password-code', identifier, sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', identifier, verifyForgotPasswordCode);


export default router;
