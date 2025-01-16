import express from 'express'
import { getPosts,
    singlePost,
    createPost,
    updatePost,
    deletePost}
from '../controllers/postsController'
import { identifier } from "../middlewares/identification";

const router = express.Router();

router.get('/all-posts', getPosts);
router.get('/single-post', singlePost);
router.post('/create-post', identifier, createPost);

router.put('/update-post', identifier, updatePost);
router.delete('/delete-post', identifier, deletePost);

export default router;