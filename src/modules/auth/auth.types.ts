export type JwtPayload = {
  id: number;
  username: string;
  fullName: string;
  iat: number;
  exp: number;
};