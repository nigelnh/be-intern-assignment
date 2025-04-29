import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Post } from './Post';

@Entity('hashtags')
export class Hashtag {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @Index({ unique: true })
  name: string;

  @ManyToMany(() => Post, (post) => post.hashtags)
  @JoinTable({
    name: 'post_hashtags',
    joinColumn: {
      name: 'hashtagId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'postId',
      referencedColumnName: 'id',
    },
  })
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
