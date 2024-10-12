import { Article } from '@app/article/entities/article.entity';

export type ArticleType = Omit<Article, 'updateTimestamp'>;
