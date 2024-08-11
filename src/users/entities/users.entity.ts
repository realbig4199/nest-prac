import { Column, Entity, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { BaseModel } from 'src/common/entity/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { Exclude } from 'class-transformer';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  nickname: string;

  @Column({
    unique: true,
  })
  @IsEmail(
    {},
    {
      message: emailValidationMessage,
    },
  )
  email: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  @Length(3, 8, {
    message: lengthValidationMessage,
  })
  /**
   * 요청 (프론트엔드 -> 백엔드)
   * plain object (JSON) -> class instance (dto)
   *
   * 응답 (백엔드 -> 프론트엔드)
   * class instance (dto) -> plain object (JSON)
   *
   * toClassOnly : class instance로 변환될 때만 (요청할 때만)
   * toPlainOnly : plain object로 변환될 때만 (응답할 때만)
   */
  @Exclude({
    toPlainOnly: true,
  }) // 요청을 받을 때에는 password가 필요하지만 응답을 할 때에는 password를 제외하고 응답
  password: string;

  @Column({
    type: 'enum',
    enum: RolesEnum,
    default: RolesEnum.USER, // 유저를 기본 값으로 정의
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
