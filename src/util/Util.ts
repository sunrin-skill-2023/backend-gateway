import { ConfigService } from '@nestjs/config';

export const isProduction = () =>
  new ConfigService().get('NODE_ENV') === 'production';
