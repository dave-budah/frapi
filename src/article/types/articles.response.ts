import { ArticleType } from '@app/article/types/article.types';

export interface ArticlesResponse {
  articles: ArticleType[];
  articlesCount: number;
}
