import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setup = async (app: INestApplication) => {
  const configService = app.get<ConfigService>(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Auth service')
    .setDescription('The auth service API description')
    .setVersion('1.0')
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  const port = configService.getOrThrow<number>('APP_PORT');

  await app.listen(port);
};
