import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { UsersModel } from 'src/users/entities/users.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);

    return true;
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  postPost(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
    // @Body('title') title: string,
    // @Body('content') content: string,
  ) {
    return this.postsService.createPost(userId, body);
  }

  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
    // @Body('title') title?: string,
    // @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
