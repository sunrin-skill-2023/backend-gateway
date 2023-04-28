import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function swagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Skill Backend Gateway')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('document', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const port = config.get<number>('SERVICE_PORT');
  const env = config.get<string>('NODE_ENV', 'development');

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  if (env === 'development') {
    await swagger(app);
  }

  await app.listen(port);

  Logger.log(`Server running on ${env} mode`, 'Bootstrap');
  Logger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
  Logger.log(
    `Swagger running on http://localhost:${port}/document`,
    `Bootstrap`,
  );
}
bootstrap();
