import { Request, Response } from 'express';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Like } from '../entities/Like';
import { Follow } from '../entities/Follow';
import { AppDataSource } from '../data-source';
import { Between } from 'typeorm';

// Define an interface for activity items
interface ActivityItem {
  type: 'post' | 'like' | 'follow';
  id: number;
  createdAt: Date;
  [key: string]: any; // Allow additional properties
}

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private postRepository = AppDataSource.getRepository(Post);
  private likeRepository = AppDataSource.getRepository(Like);
  private followRepository = AppDataSource.getRepository(Follow);

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userRepository.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const user = this.userRepository.create(req.body);
      const result = await this.userRepository.save(user);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      this.userRepository.merge(user, req.body);
      const result = await this.userRepository.save(user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user', error });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const result = await this.userRepository.delete(parseInt(req.params.id));
      if (result.affected === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error });
    }
  }

  async getUserActivity(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const type = req.query.type as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      // Check if user exists
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Set up date filter
      const dateFilter = {};
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        Object.assign(dateFilter, { createdAt: Between(start, end) });
      } else if (startDate) {
        const start = new Date(startDate);
        const end = new Date();
        Object.assign(dateFilter, { createdAt: Between(start, end) });
      } else if (endDate) {
        const start = new Date(0); // Beginning of time
        const end = new Date(endDate);
        Object.assign(dateFilter, { createdAt: Between(start, end) });
      }

      // Build activity data based on requested type
      let activities: ActivityItem[] = [];
      let totalCount = 0;

      if (!type || type === 'post') {
        // Get posts created by the user
        const [posts, postsCount] = await this.postRepository.findAndCount({
          where: {
            authorId: userId,
            ...dateFilter,
          },
          order: { createdAt: 'DESC' },
          skip: type ? 0 : offset,
          take: type ? limit : limit,
        });

        const postActivities: ActivityItem[] = posts.map((post) => ({
          type: 'post',
          id: post.id,
          content: post.content,
          createdAt: post.createdAt,
        }));

        activities = [...activities, ...postActivities];
        totalCount += postsCount;
      }

      if (!type || type === 'like') {
        // Get likes by the user
        const [likes, likesCount] = await this.likeRepository.findAndCount({
          where: {
            userId,
            ...dateFilter,
          },
          relations: ['post'],
          order: { createdAt: 'DESC' },
          skip: type ? 0 : offset,
          take: type ? limit : limit,
        });

        const likeActivities: ActivityItem[] = likes.map((like) => ({
          type: 'like',
          id: like.id,
          postId: like.postId,
          postContent: like.post.content,
          createdAt: like.createdAt,
        }));

        activities = [...activities, ...likeActivities];
        totalCount += likesCount;
      }

      if (!type || type === 'follow') {
        // Get follow actions by the user
        const [follows, followsCount] = await this.followRepository.findAndCount({
          where: {
            followerId: userId,
            ...dateFilter,
          },
          relations: ['following'],
          order: { createdAt: 'DESC' },
          skip: type ? 0 : offset,
          take: type ? limit : limit,
        });

        const followActivities: ActivityItem[] = follows.map((follow) => ({
          type: 'follow',
          id: follow.id,
          followingId: follow.followingId,
          followingName: `${follow.following.firstName} ${follow.following.lastName}`,
          createdAt: follow.createdAt,
        }));

        activities = [...activities, ...followActivities];
        totalCount += followsCount;
      }

      // Sort all activities by date (newest first)
      const sortedActivities = activities.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      // Apply pagination if no type filter
      let paginatedActivities = sortedActivities;
      if (!type) {
        paginatedActivities = sortedActivities.slice(offset, offset + limit);
      }

      res.json({
        activities: paginatedActivities,
        total: totalCount,
        limit,
        offset,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user activity', error });
    }
  }
}
