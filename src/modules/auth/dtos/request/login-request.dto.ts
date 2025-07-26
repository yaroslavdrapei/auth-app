import { IsString, Length } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  @Length(3, 50)
  username: string;

  @IsString()
  @Length(6, 50)
  password: string;
}
