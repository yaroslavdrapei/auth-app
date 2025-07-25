import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const setup = async (app: INestApplication) => {
  const configService = app.get<ConfigService>(ConfigService);

  const port = configService.getOrThrow<number>('APP_PORT');

  await app.listen(port);
}