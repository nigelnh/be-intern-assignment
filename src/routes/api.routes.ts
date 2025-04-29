import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller';
import { FollowController } from '../controllers/follow.controller';
import { UserController } from '../controllers/user.controller';
import { PostController } from '../controllers/post.controller';

export const apiRouter = Router();
const feedController = new FeedController();
const followController = new FollowController();
const userController = new UserController();
const postController = new PostController();

// Feed endpoint
apiRouter.get('/feed', feedController.getUserFeed.bind(feedController));

// Get posts by hashtag
apiRouter.get('/posts/hashtag/:tag', postController.getPostsByHashtag.bind(postController));

// Get user followers
apiRouter.get('/users/:id/followers', followController.getUserFollowers.bind(followController));

// Get user activity
apiRouter.get('/users/:id/activity', userController.getUserActivity.bind(userController));
