"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postsController_1 = require("../controllers/postsController");
const identification_1 = require("../middlewares/identification");
const router = express_1.default.Router();
router.get('/all-posts', postsController_1.getPosts);
router.get('/single-post', postsController_1.singlePost);
router.post('/create-post', identification_1.identifier, postsController_1.createPost);
router.put('/update-post', identification_1.identifier, postsController_1.updatePost);
router.delete('/delete-post', identification_1.identifier, postsController_1.deletePost);
exports.default = router;
