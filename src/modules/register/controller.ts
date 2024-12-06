import { Controller, Post, Req, Version } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RegisterInput, RegisterOutput } from '@/core/user/use-cases/user-register';
import { ApiRequest } from '@/utils/request';

import { IRegisterAdapter } from './adapter';
import { SwaggerRequest, SwaggerResponse } from './swagger';

@Controller()
@ApiTags('register')
export class RegisterController {
  constructor(private readonly registerUsecase: IRegisterAdapter) {}

  @Post('register')
  @ApiResponse(SwaggerResponse.register[200])
  @ApiResponse(SwaggerResponse.register[404])
  @ApiBody(SwaggerRequest.register)
  @Version('1')
  async register(@Req() { body, user, tracing }: ApiRequest): Promise<RegisterOutput> {
    return this.registerUsecase.execute(body as RegisterInput, { user, tracing });
  }
}
