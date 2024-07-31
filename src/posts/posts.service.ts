import { Injectable, NotFoundException } from '@nestjs/common';

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
  getAllPosts() {
    return posts;
  }

  getPostById(id: number) {
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return post;
  }

  createPost(author: string, title: string, content: string) {
    const post: PostModel = {
      id: posts.length + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };

    posts.push(post);

    return post;
  }

  updatePost(id: number, author?: string, title?: string, content?: string) {
    const post = posts.find((post) => post.id === id);

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (author) {
      post.author = author;
    }

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    return post;
  }

  deletePost(id: number) {
    const post = posts.find((post) => post.id === id);

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    posts = posts.filter((post) => post.id !== id);

    return {
      message: '게시글이 삭제되었습니다.',
    };
  }
}
