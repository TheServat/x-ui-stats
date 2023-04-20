import { IsString } from 'class-validator';

export class GetInfoDto {
  @IsString()
  config: string;
}
