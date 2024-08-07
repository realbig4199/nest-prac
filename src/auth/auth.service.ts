import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  /**
   * 구현 기능
   *
   * 1) registerWithEmail
   *  - email, nickname, password를 입력받고 사용자를 생성
   *  - 생성이 완료되면 accessToken과 refreshToken을 반환
   *
   * 2) loginWithEmail
   *  - email, password를 입력하면 사용자 검증을 진행
   *  - 검증이 완료되면 accessToken과 refreshToken을 반환
   *
   * 3) loginUser
   *  - (1)과 (2)에서 필요한 accessToken과 refreshToken을 반환
   *
   * 4) signToken
   *  - (3)에서 필요한 accessToken과 refreshToken을 sign
   *
   * 5) authenticateWithEmailAndPassword
   *  - (2)에서 로그인을 진행할 때 필요한 사용자 검증 진행
   *  - 1. 사용자가 존재하는지 확인 (email)
   *  - 2. 비밀번호가 맞는지 확인
   *  - 3. 모두 통과되면 찾은 사용자 정보 반환
   */

  /**
   * 페이로드에 들어 갈 정보
   * 1. email
   * 2. sub -> id
   * 3. type : 'access' | 'refresh'
   */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('사용자가 존재하지 않습니다.');
    }

    /**
     * bcrypt.compare의 파라미터 : true 또는 false를 반환
     * 1. 유저가 입력한 비밀번호
     * 2. DB에 저장된 비밀번호(해시된 비밀번호)
     */
    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return existingUser; // 사용자 정보 반환 (DB에 저장되어 있고, 비밀번호가 일치하는 사용자)
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  /**
   * 1. email, nickname, password를 입력받고 사용자를 생성
   * 2. 생성이 완료되면 accessToken과 refreshToken을 반환
   */
  async registerWithEmail(
    user: Pick<UsersModel, 'email' | 'nickname' | 'password'>,
  ) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }

  /**
   * Header로 부터 토큰을 받을 때
   *
   * {authorization: 'Basic {token}}
   * {authorization: 'Bearer {token}}
   */
  /**
   * @author 김진태 <realbig4199@gmail.com>
   * @decription 헤더에서 토큰 추출
   * @param {string} header
   */
  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      {
        throw new UnauthorizedException('토큰이 올바르지 않습니다.');
      }
    }

    const token = splitToken[1];

    return token;
  }

  /**
   * @author 김진태 <realbig4199@gmail.com>
   * @decription 토큰 디코딩
   * @param {string} base64string
   */
  decodeBasicToken(base64string: string) {
    const decoded = Buffer.from(base64string, 'base64').toString('utf8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('토큰이 올바르지 않습니다.');
    }

    const [email, password] = split;

    return { email, password };
  }

  /**
   * @author 김진태 <realbig4199@gmail.com>
   * @decription 토큰 검증
   * @param {string} token
   */
  verifyToken(token: string) {
    return this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });
  }

  /**
   * @author 김진태 <realbig4199@gmail.com>
   * @decription 토큰 재발급
   * @param {string} token
   */
  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException(
        '토큰 재발급은 리프레시 토큰만 가능합니다.',
      );
    }

    return this.signToken({ ...decoded }, isRefreshToken);
  }
}
