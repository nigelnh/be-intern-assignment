import { Request, Response } from 'express';
import { Like } from '../entities/Like';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { AppDataSource } from '../data-source';

export class LikeController {
  private likeRepository = AppDataSource.getRepository(Like);
  private userRepository = AppDataSource.getRepository(User);
  private postRepository = AppDataSource.getRepository(Post);

  async getAllLikes(req: Request, res: Response) {
    try {
      const likes = await this.likeRepository.find({
        relations: ['user', 'post'],
      });
      res.json(likes);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching likes', error });
    }
  }

  async getLikeById(req: Request, res: Response) {
    try {
      const like = await this.likeRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['user', 'post'],
      });

      if (!like) {
        return res.status(404).json({ message: 'Like not found' });
      }

      res.json(like);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching like', error });
    }
  }

  async createLike(req: Request, res: Response) {
    try {
      const { userId, postId } = req.body;

      // Check that user and post exist
      const user = await this.userRepository.findOneBy({ id: userId });
      const post = await this.postRepository.findOneBy({ id: postId });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Check if the like already exists
      const existingLike = await this.likeRepository.findOne({
        where: {
          userId: userId,
          postId: postId,
        },
      });

      if (existingLike) {
        return res.status(400).json({ message: 'User already liked this post' });
      }

      const like = this.likeRepository.create({
        userId,
        postId,
      });

      const result = await this.likeRepository.save(like);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating like', error });
    }
  }

  async deleteLike(req: Request, res: Response) {
    try {
      const { userId, postId } = req.body;

      const result = await this.likeRepository.delete({
        userId,
        postId,
      });

      if (result.affected === 0) {
        return res.status(404).json({ message: 'Like not found' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting like', error });
    }
  }
}
