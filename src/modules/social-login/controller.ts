import { Controller, Get, Req, Res, Version } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { ISocialLoginAdapter } from './adapter';

@Controller()
@ApiTags('social-login')
export class SocialLoginController {
  constructor(private readonly socialLoginUsecase: ISocialLoginAdapter) {}

  @Get('login/google')
  @Version('1')
  loginGoogle(@Res() res: Response): void {
    return this.socialLoginUsecase.loginGoogle(res);
  }

  @Get('login/google/callback')
  @Version('1')
  async loginGoogleCallback(@Res() res: Response, @Req() req: Request): Promise<void> {
    return this.socialLoginUsecase.loginGoogleCallback(res, req);
  }
}
