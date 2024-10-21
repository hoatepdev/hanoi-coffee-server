import { Module } from '@nestjs/common';

import { IRoleRepository } from '@/core/role/repository/role';
import { IUserRepository } from '@/core/user/repository/user';
import { RegisterUsecase } from '@/core/user/use-cases/user-register';
import { HttpModule } from '@/infra/http';
import { SecretsModule } from '@/infra/secrets';
import { ITokenAdapter, TokenLibModule } from '@/libs/token';

import { RoleModule } from '../role/module';
import { UserModule } from '../user/module';
import { IRegisterAdapter } from './adapter';
import { RegisterController } from './controller';

@Module({
  imports: [TokenLibModule, UserModule, SecretsModule, HttpModule, UserModule, RoleModule],
  controllers: [RegisterController],
  providers: [
    {
      provide: IRegisterAdapter,
      useFactory: (repository: IUserRepository, tokenService: ITokenAdapter, roleRepository: IRoleRepository) => {
        return new RegisterUsecase(repository, tokenService, roleRepository);
      },
      inject: [IUserRepository, ITokenAdapter, IRoleRepository]
    }
  ]
})
export class RegisterModule {}
