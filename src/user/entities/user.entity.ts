import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { hash } from 'bcrypt';
import { Article } from '@app/article/entities/article.entity';
// import { Role } from '@app/role/entities/role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  image: string;

  @Column({ default: '' })
  role: string;

  @Column({ select: false })
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  @OneToMany(() => Article, article => article.author)
  articles: Article[];

  @ManyToMany(() => Article)
  @JoinTable()
  favorites: Article[];

  // @ManyToMany(() => Role)
  // @JoinTable()
  // roles: Role[];
}
