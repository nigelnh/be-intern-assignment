import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Post } from '../entities/Post';
import { Follow } from '../entities/Follow';

export class FeedController {
  private postRepository = AppDataSource.getRepository(Post);
  private followRepository = AppDataSource.getRepository(Follow);

  async getUserFeed(req: Request, res: Response) {
    try {
      const userId = parseInt(req.query.userId as string);
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Get the IDs of users that the current user follows
      const following = await this.followRepository.find({
        where: { followerId: userId },
      });

      const followingIds = following.map((follow) => follow.followingId);

      // If the user doesn't follow anyone, return empty feed
      if (followingIds.length === 0) {
        return res.json({
          posts: [],
          total: 0,
          limit,
          offset,
        });
      }

      // Query posts from followed users
      const [posts, total] = await this.postRepository
        .createQueryBuilder('post')
        .where('post.authorId IN (:...followingIds)', { followingIds })
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.likes', 'likes')
        .leftJoinAndSelect('post.hashtags', 'hashtags')
        .orderBy('post.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      // Transform the data to include like count
      const postsWithDetails = posts.map((post) => {
        return {
          id: post.id,
          content: post.content,
          author: {
            id: post.author.id,
            firstName: post.author.firstName,
            lastName: post.author.lastName,
          },
          likeCount: post.likes.length,
          hashtags: post.hashtags,
          createdAt: post.createdAt,
        };
      });

      res.json({
        posts: postsWithDetails,
        total,
        limit,
        offset,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching feed', error });
    }
  }
}
