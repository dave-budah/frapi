import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
