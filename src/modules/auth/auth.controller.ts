import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dtos/request/login-request.dto';
import { JwtPayload } from './auth.types';
import { ApiResponse } from '@nestjs/swagger';
import { LoginResponseDto } from './dtos/response/login-response.dto';
import { VerifyResponseDto } from './dtos/response/verify-response.dto';
import { VerifyRequestDto } from './dtos/request/verify-request.dto';
import { CreateUserRequestDto } from './dtos/request/create-user-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ status: 201, type: LoginResponseDto })
  @Post('login')
  async login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    const { username, password } = dto;
    const token = await this.authService.login(username, password);

    return { accessToken: token };
  }

  @ApiResponse({ status: 201 })
  @Post('signup')
  async signup(@Body() dto: CreateUserRequestDto): Promise<void> {
    const { username, password, fullName } = dto;
    await this.authService.signup(username, password, fullName);
  }

  @ApiResponse({ status: 201, type: VerifyResponseDto })
  @Post('verify')
  async verify(@Body() dto: VerifyRequestDto): Promise<JwtPayload> {
    const { token } = dto;
    return await this.authService.verify(token);
  }
}
