import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './module/auth/auth.module';
import { BoardModule } from './module/board/board.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env`, `.env.development`, `.env.production`],
    }),
    AuthModule,
    BoardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
