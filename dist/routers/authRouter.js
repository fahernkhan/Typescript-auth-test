"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const identification_1 = require("../middlewares/identification");
const router = express_1.default.Router();
router.post('/signup', authController_1.signup);
router.post('/signin', authController_1.signin);
router.post('/signout', identification_1.identifier, authController_1.signout);
router.patch('/send-verification-code', identification_1.identifier, authController_1.sendVerificationCode);
router.patch('/verify-verification-code', identification_1.identifier, authController_1.verifyVerificationCode);
router.patch('/change-password', identification_1.identifier, authController_1.changePassword);
router.patch('/send-forgot-password-code', identification_1.identifier, authController_1.sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', identification_1.identifier, authController_1.verifyForgotPasswordCode);
exports.default = router;
