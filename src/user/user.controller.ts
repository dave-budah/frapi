import { Controller, Get, Post, Body, Delete, UsePipes, ValidationPipe, UseGuards, Put } from '@nestjs/common';
import { UserService } from '@app/user/user.service';
import { CreateUserDto } from '@app/user/dto/create-user.dto';
import { UpdateUserDto } from '@app/user/dto/update-user.dto';
import { UserResponse } from '@app/user/types/user..response';
import { LoginUserDto } from '@app/user/dto/login-user.dto';
import { UserDecorator } from '@app/user/decorators/user.decorator';
import { User } from '@app/user/entities/user.entity';
import { AuthGuard } from '@app/user/guards/auth.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UsePipes(new ValidationPipe())
  async create(@Body('user') createUserDto: CreateUserDto): Promise<UserResponse> {
    const user = await this.userService.create(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async login(@Body('user') loginDto: LoginUserDto): Promise<UserResponse> {
    const user = await this.userService.login(loginDto);
    return this.userService.buildUserResponse(user);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(@UserDecorator() user: User): Promise<UserResponse> {
    return this.userService.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  async updateCurrentUser(@UserDecorator('id') currentUserId: number, @Body('user') updateUserDto: UpdateUserDto): Promise<UserResponse> {
    const user = await this.userService.update(currentUserId, updateUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Delete('user')
  @UseGuards(AuthGuard)
  async deleteCurrentUser(@UserDecorator('id') currentUserId: number): Promise<void> {
    await this.userService.deleteAccount(currentUserId);
  }
}
