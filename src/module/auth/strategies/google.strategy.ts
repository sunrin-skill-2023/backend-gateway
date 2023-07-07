import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { firstValueFrom } from 'rxjs';
import { AuthServiceClient } from 'shared/src/generated/auth.proto';
import { grpcClientOptions } from 'shared/src/options/auth.option';

@Injectable()
export class GoogleStrategy
  extends PassportStrategy(Strategy, 'google')
  implements OnModuleInit
{
  @Client(grpcClientOptions) private readonly client: ClientGrpc;
  private authService: AuthServiceClient;

  constructor(private readonly config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { emails, name } = profile;

    let user = await firstValueFrom(
      this.authService.getUserByPartialData({
        email: emails[0].value,
      }),
    ).catch(() => null);

    if (user) {
      return done(null, user);
    }

    user = await firstValueFrom(
      this.authService.createUser({
        email: emails[0].value,
        name: name.familyName + name.givenName,
      }),
    );

    done(null, user);
  }
}
