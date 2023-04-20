import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { GetInfoDto } from './dto';

@Controller('/api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  getInfo(@Body() config: GetInfoDto) {
    return this.appService.getInfo(config.config);
  }
}
