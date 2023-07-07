import {
  Controller,
  Get,
  OnModuleInit,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { grpcClientOptions } from 'shared/src/options/auth.option';
import { GoogleGuard } from './guards/google.guard';
import { AccessGuard } from './guards/acess.guard';
import { AuthServiceClient } from 'shared/src/generated/auth.proto';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { isProduction } from 'src/util/Util';

export const ACCESS_TOKEN = 'Access';
export const ACCESS_TOKEN_OPTION = () => ({
  ...(isProduction() ? { domain: process.env.SERVICE_DOMAIN } : {}),
  httpOnly: isProduction(),
  secure: isProduction(),
  maxAge: 1000 * 60 * 60 * 24 * 3,
});

@Controller('auth')
export class AuthController implements OnModuleInit {
  @Client(grpcClientOptions) private readonly client: ClientGrpc;
  private authService: AuthServiceClient;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  @Get('/user')
  @UseGuards(AccessGuard)
  @ApiBearerAuth()
  async getUser(@Req() req: Express.Request) {
    return this.authService.getUserByUuid({ uuid: req.user.uuid });
  }

  @Get('/google')
  @UseGuards(GoogleGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth() {}

  @Get('/google/callback')
  @UseGuards(GoogleGuard)
  async googleCallback(@Req() req: Express.Request, @Res() res: Response) {
    const { token } = await firstValueFrom(
      this.authService.createAccessTokenByUuid({
        uuid: req.user.uuid,
      }),
    );
    res.cookie(ACCESS_TOKEN, token, ACCESS_TOKEN_OPTION());

    return res.redirect(
      `${this.config.get<string>(
        'FRONTEND_URL',
      )}/login/callback?token=${token}`,
    );
  }
}
