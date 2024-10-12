import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { ArticleService } from '@app/article/article.service';
import { CreateArticleDto } from '@app/article/dto/create-article.dto';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserDecorator } from '@app/user/decorators/user.decorator';
import { User } from '@app/user/entities/user.entity';
import { ArticleResponse } from '@app/article/types/article.response';
import { UpdateArticleDto } from '@app/article/dto/update-article.dto';
import { ArticlesResponse } from '@app/article/types/articles.response';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async create(@UserDecorator() currentUser: User, @Body('article') createArticleDto: CreateArticleDto): Promise<ArticleResponse> {
    const article = await this.articleService.create(currentUser, createArticleDto);
    return this.articleService.buildArticleResponse(article);
  }

  @Get()
  async findAll(@UserDecorator('id') currentUser: number, @Query() query: any): Promise<ArticlesResponse> {
    return await this.articleService.findAll(currentUser, query);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<ArticleResponse> {
    const article = await this.articleService.findBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateArticle(@UserDecorator('id') currentUser: number, @Param('slug') slug: string, @Body('article') updateArticleDto: UpdateArticleDto) {
    const article = await this.articleService.updateArticle(slug, updateArticleDto, currentUser);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(@UserDecorator('id') currentUser: number, @Param('slug') slug: string) {
    return await this.articleService.deleteArticle(slug, currentUser);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async addArticleToFavorites(@UserDecorator('id') currentUser: number, @Param('slug') slug: string): Promise<ArticleResponse> {
    const article = await this.articleService.addArticleToFavorites(slug, currentUser);
    return this.articleService.buildArticleResponse(article);
  }
  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async deleteArticleToFavorites(@UserDecorator('id') currentUser: number, @Param('slug') slug: string): Promise<ArticleResponse> {
    const article = await this.articleService.deleteArticleToFavorites(slug, currentUser);
    return this.articleService.buildArticleResponse(article);
  }
}
