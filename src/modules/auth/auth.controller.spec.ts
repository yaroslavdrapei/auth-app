import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dtos/request/login-request.dto';
import { CreateUserRequestDto } from './dtos/request/create-user-request.dto';
import { VerifyRequestDto } from './dtos/request/verify-request.dto';
import { JwtPayload } from './auth.types';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    login: jest.fn(),
    signup: jest.fn(),
    verify: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compile();

    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks()
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call login and return access token', async () => {
      const dto: LoginRequestDto = { username: 'user1', password: 'pass' };
      authService.login.mockResolvedValue('token123');

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith('user1', 'pass');
      expect(result).toEqual({ accessToken: 'token123' });
    });
  });

  describe('signup', () => {
    it('should call signup with correct params', async () => {
      const dto: CreateUserRequestDto = {
        username: 'user1',
        password: 'pass',
        fullName: 'User One'
      };

      authService.signup.mockResolvedValue(undefined);

      await controller.signup(dto);

      expect(authService.signup).toHaveBeenCalledWith('user1', 'pass', 'User One');
    });
  });

  describe('verify', () => {
    it('should call verify and return jwt payload', async () => {
      const dto: VerifyRequestDto = { token: 'token123' };
      const payload = { id: 1, username: 'user1', fullName: 'User One' } as JwtPayload;

      authService.verify.mockResolvedValue(payload);

      const result = await controller.verify(dto);

      expect(authService.verify).toHaveBeenCalledWith('token123');
      expect(result).toEqual(payload);
    });
  });
});
