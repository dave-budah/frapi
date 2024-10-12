import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from '@app/article/dto/create-article.dto';
import { UpdateArticleDto } from '@app/article/dto/update-article.dto';
import { Article } from '@app/article/entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeleteResult, Repository } from 'typeorm';
import { User } from '@app/user/entities/user.entity';
import { ArticleResponse } from '@app/article/types/article.response';
import slugify from 'slugify';
import { ArticlesResponse } from '@app/article/types/articles.response';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(currentUser: User, createArticleDto: CreateArticleDto): Promise<Article> {
    const article = new Article();
    Object.assign(article, createArticleDto);
    if (!article.tagList) {
      article.tagList = [];
    }
    article.slug = this.getSlug(createArticleDto.title);
    article.author = currentUser;
    return await this.articleRepository.save(article);
  }

  // Method to generate a slug
  private getSlug(title: string): string {
    return slugify(title, { lower: true }) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }

  buildArticleResponse(article: Article): ArticleResponse {
    return { article };
  }

  async findBySlug(slug: string): Promise<Article> {
    return await this.articleRepository.findOne({ where: { slug } });
  }

  // Like an article
  async addArticleToFavorites(slug: string, userId: number): Promise<Article> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['favorites'] });

    const isNotFavorited = user.favorites.findIndex(articleInFavorites => articleInFavorites.id === article.id) === -1;
    if (isNotFavorited) {
      user.favorites.push(article);
      article.favouritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }

  // Unlike an article
  async deleteArticleToFavorites(slug: string, userId: number): Promise<Article> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['favorites'] });

    const articleIndex = user.favorites.findIndex(articleInFavorites => articleInFavorites.id === article.id);
    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favouritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }

  async findAll(currentUser: number, query: any): Promise<ArticlesResponse> {
    const queryBuilder = this.dataSource.getRepository(Article).createQueryBuilder('articles').leftJoinAndSelect('articles.author', 'author');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', { tag: `%${query.tag}%` });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({ where: { username: query.author } });
      queryBuilder.andWhere('articles.authorId = :id', { id: author.id });
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne({
        where: { username: query.favorited },
        relations: ['favorites'],
      });
      const ids = author.favorites.map(el => el.id);

      if (ids.length > 0) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }
    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    let favoriteIds: number[] = [];

    if (currentUser) {
      const currentUserId = await this.userRepository.findOne({
        where: { id: currentUser },
        relations: ['favorites'],
      });
      favoriteIds = currentUserId.favorites.map(favorite => favorite.id);
    }
    const articles = await queryBuilder.getMany();
    const articlesWithFavorited = articles.map(article => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return {
      articles: articlesWithFavorited,
      articlesCount,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} article`;
  }
  // Delete an article
  async deleteArticle(slug: string, currentUser: number): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }
    if (article.author.id !== currentUser) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  //  Update article
  async updateArticle(slug: string, updateArticleDto: UpdateArticleDto, currentUser: number): Promise<Article> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }
    if (article.author.id !== currentUser) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepository.save(article);
  }
}
