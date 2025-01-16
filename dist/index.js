"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const authRouter_1 = __importDefault(require("./routers/authRouter"));
const postsRouter_1 = __importDefault(require("./routers/postsRouter"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => {
    console.log('Database connected');
})
    .catch((error) => {
    console.log(error.message);
});
app.use('/api/auth', authRouter_1.default);
app.use('/api/posts', postsRouter_1.default);
app.get('/', (req, res) => {
    res.json({ message: 'Hello from the server' });
});
app.listen(process.env.PORT, () => {
    console.log('listening...');
});
