import { Request, Response } from 'express';
import { Follow } from '../entities/Follow';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';

export class FollowController {
  private followRepository = AppDataSource.getRepository(Follow);
  private userRepository = AppDataSource.getRepository(User);

  async getAllFollows(req: Request, res: Response) {
    try {
      const follows = await this.followRepository.find({
        relations: ['follower', 'following'],
      });
      res.json(follows);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching follows', error });
    }
  }

  async getFollowById(req: Request, res: Response) {
    try {
      const follow = await this.followRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['follower', 'following'],
      });

      if (!follow) {
        return res.status(404).json({ message: 'Follow relationship not found' });
      }

      res.json(follow);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching follow relationship', error });
    }
  }

  async createFollow(req: Request, res: Response) {
    try {
      const { followerId, followingId } = req.body;

      // Check that follower and following users exist
      const follower = await this.userRepository.findOneBy({ id: followerId });
      const following = await this.userRepository.findOneBy({ id: followingId });

      if (!follower) {
        return res.status(404).json({ message: 'Follower user not found' });
      }

      if (!following) {
        return res.status(404).json({ message: 'Following user not found' });
      }

      // Check if the follow relationship already exists
      const existingFollow = await this.followRepository.findOne({
        where: {
          followerId: followerId,
          followingId: followingId,
        },
      });

      if (existingFollow) {
        return res.status(400).json({ message: 'Follow relationship already exists' });
      }

      const follow = this.followRepository.create({
        followerId,
        followingId,
      });

      const result = await this.followRepository.save(follow);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating follow relationship', error });
    }
  }

  async deleteFollow(req: Request, res: Response) {
    try {
      const { followerId, followingId } = req.body;

      const result = await this.followRepository.delete({
        followerId,
        followingId,
      });

      if (result.affected === 0) {
        return res.status(404).json({ message: 'Follow relationship not found' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting follow relationship', error });
    }
  }

  async getUserFollowers(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      // Check if user exists
      const user = await this.userRepository.findOneBy({ id: userId });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get total count first
      const totalCount = await this.followRepository.count({
        where: { followingId: userId },
      });

      // Get followers with pagination
      const followers = await this.followRepository.find({
        where: { followingId: userId },
        relations: ['follower'],
        order: { createdAt: 'DESC' },
        skip: offset,
        take: limit,
      });

      // Map to include only necessary follower information
      const formattedFollowers = followers.map((follow) => ({
        id: follow.follower.id,
        firstName: follow.follower.firstName,
        lastName: follow.follower.lastName,
        email: follow.follower.email,
        followDate: follow.createdAt,
      }));

      res.json({
        followers: formattedFollowers,
        total: totalCount,
        limit,
        offset,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user followers', error });
    }
  }
}
