import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { read } from 'fs';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async createUser(nickname: string, email: string, password: string) {
    const user = this.usersRepository.create({
      nickname,
      email,
      password,
    });

    const newUser = await this.usersRepository.save(user);

    return newUser;
  }

  async getAllUsers() {
    const allUser = await this.usersRepository.find();

    return allUser;
  }
}
