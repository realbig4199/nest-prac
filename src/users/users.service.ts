import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { read } from 'fs';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async createUser(user: Pick<UsersModel, 'nickname' | 'email' | 'password'>) {
    this.logger.log(
      `입력된 데이터 : 닉네임 : ${user.nickname}, 이메일 : ${user.email}`,
    );
    const nicknameExists = await this.usersRepository.findOne({
      where: {
        nickname: user.nickname,
      },
    });

    if (nicknameExists) {
      throw new BadRequestException('유저가 이미 존재합니다.');
    }

    const emailExists = await this.usersRepository.exists({
      where: {
        email: user.email,
      },
    });

    if (emailExists) {
      throw new BadRequestException('이메일이 이미 존재합니다.');
    }

    const userObject = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    const newUser = await this.usersRepository.save(userObject);

    return newUser;
  }

  async getAllUsers() {
    const allUser = await this.usersRepository.find();

    return allUser;
  }

  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }
}
