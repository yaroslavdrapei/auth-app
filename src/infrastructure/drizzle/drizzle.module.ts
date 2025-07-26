import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './drizzle.schema';
import { DRIZZLE_CONNECTION } from './drizzle.constants';
import { DrizzleDb } from './drizzle.types';
import { UsersRepository } from './repositories/users.repository';

@Module({
  providers: [
    {
      provide: DRIZZLE_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.getOrThrow<string>('DATABASE_URL');

        const pool = new Pool({
          connectionString
        });

        return drizzle(pool, { schema }) as DrizzleDb;
      }
    },
    UsersRepository
  ],
  exports: [DRIZZLE_CONNECTION, UsersRepository]
})
export class DrizzleModule {}
