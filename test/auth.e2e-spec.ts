import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DrizzleDb } from '@src/infrastructure/drizzle/drizzle.types';
import { DRIZZLE_CONNECTION } from '@src/infrastructure/drizzle/drizzle.constants';
import { users } from '@src/infrastructure/drizzle/drizzle.schema';
import { App } from 'supertest/types';

describe('Auth flow (e2e)', () => {
  let app: INestApplication<App>;
  let db: DrizzleDb;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    db = moduleRef.get<DrizzleDb>(DRIZZLE_CONNECTION);
  });

  afterEach(async () => {
    await db.delete(users);             
  });

  afterAll(async () => {
    await app.close();
  });

  it('auth flow: signup, login, verify', async () => {
    const user = {
      username: 'testuser',
      password: 'supersecret',
      fullName: 'Test User',
    };

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(user)
      .expect(201);

    const { body: loginBody } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: user.username, password: user.password })
      .expect(201);

    expect(loginBody).toHaveProperty('accessToken');
    const token = loginBody.accessToken;

    const { body: verifyBody } = await request(app.getHttpServer())
      .post('/auth/verify')
      .send({ token })
      .expect(201);

    expect(verifyBody).toMatchObject({ username: user.username });
  });
});
