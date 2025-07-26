import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
        signOptions: {
          expiresIn: `${config.getOrThrow('JWT_EXPIRATION_IN_MINUTES')}m`
        }
      })
    }),
    InfrastructureModule
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
