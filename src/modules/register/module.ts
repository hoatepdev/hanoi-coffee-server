import { Module } from '@nestjs/common';

import { IRoleRepository } from '@/core/role/repository/role';
import { IUserRepository } from '@/core/user/repository/user';
import { RegisterUsecase } from '@/core/user/use-cases/user-register';
import { HttpModule } from '@/infra/http';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';

import { RoleModule } from '../role/module';
import { UserModule } from '../user/module';
import { IRegisterAdapter } from './adapter';
import { RegisterController } from './controller';

@Module({
  imports: [LoggerModule, UserModule, SecretsModule, HttpModule, RoleModule],
  controllers: [RegisterController],
  providers: [
    {
      provide: IRegisterAdapter,
      useFactory: (repository: IUserRepository, loggerService: ILoggerAdapter, roleRepository: IRoleRepository) => {
        return new RegisterUsecase(repository, loggerService, roleRepository);
      },
      inject: [IUserRepository, ILoggerAdapter, IRoleRepository]
    }
  ]
})
export class RegisterModule {}
