import { Controller, Post, Req, Version } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { IUserRepository } from '@/core/user/repository/user';
import { LoginInput, LoginOutput } from '@/core/user/use-cases/user-login';
import { RefreshTokenInput, RefreshTokenOutput } from '@/core/user/use-cases/user-refresh-token';
import { IHttpAdapter } from '@/infra/http';
import { ISecretsAdapter } from '@/infra/secrets';
import { ITokenAdapter } from '@/libs/token';
import { ApiRequest } from '@/utils/request';

import { ILoginAdapter, IRefreshTokenAdapter } from './adapter';
import { SwaggerRequest, SwaggerResponse } from './swagger';

@Controller()
@ApiTags('login')
export class LoginController {
  constructor(
    private readonly loginUsecase: ILoginAdapter,
    private readonly refreshTokenUsecase: IRefreshTokenAdapter,
    private readonly secret: ISecretsAdapter,
    private readonly http: IHttpAdapter,
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenAdapter
  ) {}

  @Post('login')
  @ApiResponse(SwaggerResponse.login[200])
  @ApiResponse(SwaggerResponse.login[404])
  @ApiBody(SwaggerRequest.login)
  @Version('1')
  async login(@Req() { body, user, tracing }: ApiRequest): Promise<LoginOutput> {
    return this.loginUsecase.execute(body as LoginInput, { user, tracing });
  }

  @Post('refresh')
  @ApiResponse(SwaggerResponse.refresh[200])
  @ApiResponse(SwaggerResponse.refresh[404])
  @ApiBody(SwaggerRequest.refresh)
  @Version('1')
  async refresh(@Req() { body }: ApiRequest): Promise<RefreshTokenOutput> {
    return this.refreshTokenUsecase.execute(body as RefreshTokenInput);
  }
}
