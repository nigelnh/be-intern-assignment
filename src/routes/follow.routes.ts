import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createFollowSchema, deleteFollowSchema } from '../validations/follow.validation';
import { FollowController } from '../controllers/follow.controller';

export const followRouter = Router();
const followController = new FollowController();

// Get all follows
followRouter.get('/', followController.getAllFollows.bind(followController));

// Get follow by id
followRouter.get('/:id', followController.getFollowById.bind(followController));

// Create new follow relationship
followRouter.post(
  '/',
  validate(createFollowSchema),
  followController.createFollow.bind(followController)
);

// Delete follow relationship
followRouter.delete(
  '/',
  validate(deleteFollowSchema),
  followController.deleteFollow.bind(followController)
);
