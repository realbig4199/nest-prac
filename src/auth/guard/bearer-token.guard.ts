import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class BearTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const rawToken = request.headers.authorization;

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const result = await this.authService.verifyToken(token);

    const user = await this.usersService.getUserByEmail(result.email);
    /**
     * 요청(request) 객체에 넣을 정보
     * 1. 사용자 정보 - user
     * 2. 토큰 정보 - token
     * 3. 토큰 타입 - access | refresh
     */
    request.token = token;
    request.tokenType = result.type;
    request.user = user;

    return true;
  }
}

@Injectable()
export class AccessTokenGuard extends BearTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();

    if (request.tokenType !== 'access') {
      throw new UnauthorizedException('엑세스 토큰이 아닙니다.');
    }

    return true;
  }
}

@Injectable()
export class RefreshTokenGuard extends BearTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();

    if (request.tokenType !== 'refresh') {
      throw new UnauthorizedException('리프레시 토큰이 아닙니다.');
    }

    return true;
  }
}
