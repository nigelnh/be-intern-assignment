import { Request, Response } from 'express';
import { Post } from '../entities/Post';
import { Hashtag } from '../entities/Hashtag';
import { AppDataSource } from '../data-source';
import { In } from 'typeorm';

export class PostController {
  private postRepository = AppDataSource.getRepository(Post);
  private hashtagRepository = AppDataSource.getRepository(Hashtag);

  async getAllPosts(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const [posts, total] = await this.postRepository.findAndCount({
        relations: ['author', 'likes', 'hashtags'],
        skip: offset,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      res.json({
        posts,
        total,
        limit,
        offset,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching posts', error });
    }
  }

  async getPostById(req: Request, res: Response) {
    try {
      const post = await this.postRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['author', 'likes', 'hashtags'],
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post', error });
    }
  }

  async createPost(req: Request, res: Response) {
    try {
      const { content, authorId } = req.body;
      const post = this.postRepository.create({ content, authorId });

      // Extract hashtags from content
      const hashtags = this.extractHashtags(content);
      if (hashtags.length > 0) {
        const existingHashtags = await this.hashtagRepository.find({
          where: { name: In(hashtags) },
        });

        const existingHashtagNames = existingHashtags.map((h) => h.name);

        // Create new hashtags if they don't exist
        const newHashtags = await Promise.all(
          hashtags
            .filter((name) => !existingHashtagNames.includes(name))
            .map(async (name) => {
              const hashtag = this.hashtagRepository.create({ name });
              return await this.hashtagRepository.save(hashtag);
            })
        );

        post.hashtags = [...existingHashtags, ...newHashtags];
      }

      const result = await this.postRepository.save(post);

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating post', error });
    }
  }

  async updatePost(req: Request, res: Response) {
    try {
      const post = await this.postRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['hashtags'],
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const { content } = req.body;
      post.content = content;

      // If content is updated, update hashtags
      if (content) {
        // Extract hashtags from new content
        const hashtags = this.extractHashtags(content);

        // Get existing hashtags or create new ones
        if (hashtags.length > 0) {
          const existingHashtags = await this.hashtagRepository.find({
            where: { name: In(hashtags) },
          });

          const existingHashtagNames = existingHashtags.map((h) => h.name);

          // Create new hashtags if they don't exist
          const newHashtags = await Promise.all(
            hashtags
              .filter((name) => !existingHashtagNames.includes(name))
              .map(async (name) => {
                const hashtag = this.hashtagRepository.create({ name });
                return await this.hashtagRepository.save(hashtag);
              })
          );

          post.hashtags = [...existingHashtags, ...newHashtags];
        } else {
          post.hashtags = [];
        }
      }

      const result = await this.postRepository.save(post);

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating post', error });
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const result = await this.postRepository.delete(parseInt(req.params.id));

      if (result.affected === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting post', error });
    }
  }

  async getPostsByHashtag(req: Request, res: Response) {
    try {
      const tag = req.params.tag;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      // Find the hashtag (case insensitive)
      const hashtag = await this.hashtagRepository.findOne({
        where: { name: tag.toLowerCase() },
      });

      if (!hashtag) {
        return res.json({
          posts: [],
          total: 0,
          limit,
          offset,
        });
      }

      // Find posts with this hashtag
      const [posts, total] = await this.postRepository
        .createQueryBuilder('post')
        .innerJoinAndSelect('post.hashtags', 'hashtag', 'hashtag.id = :hashtagId', {
          hashtagId: hashtag.id,
        })
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.likes', 'likes')
        .orderBy('post.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      // Calculate like count for each post
      const postsWithLikeCount = posts.map((post) => {
        return {
          ...post,
          likeCount: post.likes.length,
        };
      });

      res.json({
        posts: postsWithLikeCount,
        total,
        limit,
        offset,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching posts by hashtag', error });
    }
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);

    if (!matches) return [];

    // Extract hashtag without the # and convert to lowercase
    return matches.map((tag) => tag.slice(1).toLowerCase());
  }
}
