import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';

export interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts: PostModel[] = [
  {
    id: 1,
    author: '김진태',
    title: '반갑습니다',
    content: '신규 가입했습니다~',
    likeCount: 10,
    commentCount: 3,
  },
  {
    id: 2,
    author: '김진태1',
    title: '반갑습니다1',
    content: '신규 가입했습니다~1',
    likeCount: 11,
    commentCount: 4,
  },
  {
    id: 3,
    author: '김진태2',
    title: '반갑습니다2',
    content: '신규 가입했습니다~2',
    likeCount: 12,
    commentCount: 5,
  },
];

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  async getAllPosts() {
    return await this.postsRepository.find({ relations: ['author'] });
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return post;
  }

  async createPost(authorId: number, title: string, content: string) {
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async updatePost(id: number, title?: string, content?: string) {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    // save 메서드의 두 가지 기능
    // 1) id를 기준으로 데이터가 존재하지 않으면 새로운 데이터를 생성
    // 2) id를 기준으로 데이터가 존재하면 해당 데이터를 업데이트(수정)
    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async deletePost(id: number) {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    await this.postsRepository.delete(id);

    return id;
  }
}
