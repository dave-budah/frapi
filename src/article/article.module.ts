import { Module } from '@nestjs/common';
import { ArticleService } from '@app/article/article.service';
import { ArticleController } from '@app/article/article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '@app/article/entities/article.entity';
import { User } from '@app/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Article, User])],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
