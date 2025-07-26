import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '@src/infrastructure/drizzle/repositories/users.repository';
import { RedisService } from '@src/infrastructure/redis/redis.service';

describe('AuthService', () => {
  let service: AuthService;

  const usersRepository = {
    findByUsername: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn()
  };

  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn()
  };

  const redisService = {
    get: jest.fn(),
    set: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: usersRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: RedisService, useValue: redisService }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw bad request exception if user not found', async () => {
      usersRepository.findByUsername.mockResolvedValue(null);

      await expect(service.login('user1', 'pass')).rejects.toThrow(BadRequestException);
    });

    it('should throw bad request exception if password is invalid', async () => {
      usersRepository.findByUsername.mockResolvedValue({
        id: 1,
        username: 'user1',
        fullName: 'User One',
        passwordHash: 'hash'
      });

      jest.spyOn(argon2, 'verify').mockResolvedValue(false);

      await expect(service.login('user1', 'wrongpass')).rejects.toThrow(BadRequestException);
    });

    it('should return a jwt token on successful login', async () => {
      const mockUser = {
        id: 1,
        username: 'user1',
        fullName: 'User One',
        passwordHash: 'hash'
      };
      usersRepository.findByUsername.mockResolvedValue(mockUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token123');

      const token = await service.login('user1', 'correctpass');

      expect(token).toBe('token123');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: mockUser.id,
        username: mockUser.username,
        fullName: mockUser.fullName
      });
    });
  });

  describe('signup', () => {
    it('should throw conflict exception if username already exists', async () => {
      usersRepository.findAll.mockResolvedValue([{ username: 'user1' }]);

      await expect(service.signup('user1', 'pass', 'Full Name')).rejects.toThrow(ConflictException);
    });

    it('should hash the password and create a new user', async () => {
      usersRepository.findAll.mockResolvedValue([]);
      jest.spyOn(argon2, 'hash').mockResolvedValue('hashedpass');

      await service.signup('newuser', 'pass', 'New User');

      expect(argon2.hash).toHaveBeenCalledWith('pass');
      expect(usersRepository.create).toHaveBeenCalledWith({
        username: 'newuser',
        passwordHash: 'hashedpass',
        fullName: 'New User'
      });
    });
  });

  describe('verify', () => {
    it('should return cached payload if found in redis', async () => {
      const cachedPayload = { id: 1, username: 'user1', fullName: 'User One', exp: 9999999999 };
      redisService.get.mockResolvedValue(JSON.stringify(cachedPayload));

      const result = await service.verify('token123');

      expect(redisService.get).toHaveBeenCalledWith('verify:token123');
      expect(result).toEqual(cachedPayload);
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should verify token and cache it if not cached', async () => {
      redisService.get.mockResolvedValue(null);
      const now = Math.floor(Date.now() / 1000);
      const payload = { id: 1, username: 'user1', fullName: 'User One', exp: now + 1000 };
      jwtService.verifyAsync.mockResolvedValue(payload);
      redisService.set.mockResolvedValue(undefined);

      const result = await service.verify('token123');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('token123');
      expect(redisService.set).toHaveBeenCalledWith('verify:token123', JSON.stringify(payload), payload.exp - now);
      expect(result).toEqual(payload);
    });

    it('should throw unauthorized exception if token expired or invalid', async () => {
      redisService.get.mockResolvedValue(null);
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verify('badtoken')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw unauthorized exception if token is expired', async () => {
      redisService.get.mockResolvedValue(null);
      const now = Math.floor(Date.now() / 1000);
      const expiredPayload = { id: 1, username: 'user1', fullName: 'User One', exp: now - 10 };
      jwtService.verifyAsync.mockResolvedValue(expiredPayload);

      await expect(service.verify('expiredtoken')).rejects.toThrow(UnauthorizedException);
    });
  });
});
