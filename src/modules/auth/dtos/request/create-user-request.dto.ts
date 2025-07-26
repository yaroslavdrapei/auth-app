import { IsString, Length } from 'class-validator';

export class CreateUserRequestDto {
  @IsString()
  @Length(3, 50)
  username: string;

  @IsString()
  @Length(6, 50)
  password: string;

  @IsString()
  fullName: string;
}