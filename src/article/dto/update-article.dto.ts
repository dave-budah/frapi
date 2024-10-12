import { IsNotEmpty } from 'class-validator';

export class UpdateArticleDto {
  @IsNotEmpty()
  readonly title: string;

  @IsNotEmpty()
  readonly description: string;

  readonly imageUrl: string;

  @IsNotEmpty()
  readonly content: string;

  readonly tagList?: string[];
}
