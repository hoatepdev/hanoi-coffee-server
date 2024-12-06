import { Module } from '@nestjs/common';

import { IRoleRepository } from '@/core/role/repository/role';
import { IUserRepository } from '@/core/user/repository/user';
import { GoogleLoginUsecase } from '@/core/user/use-cases/user-google-login';
import { HttpModule, IHttpAdapter } from '@/infra/http';
import { ISecretsAdapter, SecretsModule } from '@/infra/secrets';
import { ITokenAdapter, TokenLibModule } from '@/libs/token';

import { RoleModule } from '../role/module';
import { UserModule } from '../user/module';
import { ISocialLoginAdapter } from './adapter';
import { SocialLoginController } from './controller';

@Module({
  imports: [TokenLibModule, UserModule, SecretsModule, HttpModule, RoleModule],
  controllers: [SocialLoginController],
  providers: [
    {
      provide: ISocialLoginAdapter,
      useFactory: (
        userRepository: IUserRepository,
        tokenService: ITokenAdapter,
        secrets: ISecretsAdapter,
        http: IHttpAdapter,
        roleRepository: IRoleRepository
      ) => {
        return new GoogleLoginUsecase(userRepository, tokenService, secrets, http, roleRepository);
      },
      inject: [IUserRepository, ITokenAdapter, ISecretsAdapter, IHttpAdapter, IRoleRepository]
    }
  ]
})
export class SocialLoginModule {}
