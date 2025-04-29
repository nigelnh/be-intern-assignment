import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createLikeSchema, deleteLikeSchema } from '../validations/like.validation';
import { LikeController } from '../controllers/like.controller';

export const likeRouter = Router();
const likeController = new LikeController();

// Get all likes
likeRouter.get('/', likeController.getAllLikes.bind(likeController));

// Get like by id
likeRouter.get('/:id', likeController.getLikeById.bind(likeController));

// Create new like
likeRouter.post('/', validate(createLikeSchema), likeController.createLike.bind(likeController));

// Delete like
likeRouter.delete('/', validate(deleteLikeSchema), likeController.deleteLike.bind(likeController));
