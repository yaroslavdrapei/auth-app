import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_CONNECTION } from '../drizzle.constants';
import { DrizzleDb } from '../drizzle.types';
import { NewUser, User, users } from '../schemas/users.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private readonly db: DrizzleDb
  ) {}

  async findAll(): Promise<User[]> {
    return await this.db.select().from(users);
  }

  async findByUsername(username: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));

    if (!user) {
      return null;
    }

    return user;
  }

  async create(userData: NewUser): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values({
        username: userData.username,
        passwordHash: userData.passwordHash,
        fullName: userData.fullName
      })
      .returning();

    return user;
  }
}
