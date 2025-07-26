import { Expose } from "class-transformer";


export class VerifyResponseDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  fullName: string;

  @Expose()
  iat: number;

  @Expose()
  exp: number;
}