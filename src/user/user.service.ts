import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@app/user/dto/create-user.dto';
import { UpdateUserDto } from '@app/user/dto/update-user.dto';
import { User } from '@app/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserResponse } from '@app/user/types/user..response';
import { LoginUserDto } from '@app/user/dto/login-user.dto';
import { compare } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    const userByUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (userByEmail || userByUsername) {
      throw new HttpException('Email & username already exist', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const newUser = new User();
    Object.assign(newUser, createUserDto);
    return await this.userRepository.save(newUser);
  }

  generateJwt(user: User): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }
  buildUserResponse(user: User): UserResponse {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async login(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      select: ['id', 'username', 'email', 'bio', 'image', 'role', 'password'],
    });

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const isPasswordCorrect = await compare(loginUserDto.password, user.password);
    if (!isPasswordCorrect) {
      throw new HttpException('Invalid credentials', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    delete user.password;
    return user;
  }

  // Fetch all users in database
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  //  Update user profile
  async update(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  // Delete user profile
  async deleteAccount(userId: number): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await this.userRepository.delete(userId);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
