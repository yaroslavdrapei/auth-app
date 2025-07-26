import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '@infrastructure/drizzle/repositories/users.repository';
import * as argon2 from 'argon2';
import { NewUser } from '@infrastructure/drizzle/drizzle.schema';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService
  ) {}

  async login(username: string, password: string): Promise<string> {
    const user = await this.usersRepository.findByUsername(username);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload: JwtPayload = { id: user.id, username: user.username, fullName: user.fullName };
    const token = await this.jwtService.signAsync(payload);

    return token;
  }

  async signup(username: string, password: string, fullName: string): Promise<void> {
    const users = await this.usersRepository.findAll();
    if (users.some((user) => user.username === username)) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await argon2.hash(password);
    const newUser: NewUser = {
      username,
      passwordHash,
      fullName
    };

    await this.usersRepository.create(newUser);
  }

  async verify(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
