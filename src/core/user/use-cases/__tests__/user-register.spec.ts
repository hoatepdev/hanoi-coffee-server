import { Test } from '@nestjs/testing';

import { RoleEntity, RoleEnum } from '@/core/role/entity/role';
import { IRoleRepository } from '@/core/role/repository/role';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { IRegisterAdapter } from '@/modules/register/adapter';
import { ApiConflictException, ApiNotFoundException } from '@/utils/exception';
import { expectZodError, getMockTracing, getMockUUID } from '@/utils/tests';

import { UserEntity } from '../../entity/user';
import { UserPasswordEntity } from '../../entity/user-password';
import { IUserRepository } from '../../repository/user';
import { RegisterInput, RegisterUsecase } from '../user-register';

describe(RegisterUsecase.name, () => {
  let usecase: IRegisterAdapter;
  let repository: IUserRepository;
  let roleRepository: IRoleRepository;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [
        {
          provide: IUserRepository,
          useValue: {}
        },
        {
          provide: IRoleRepository,
          useValue: {}
        },
        {
          provide: IRegisterAdapter,
          useFactory: (userRepository: IUserRepository, logger: ILoggerAdapter, roleRepository: IRoleRepository) => {
            return new RegisterUsecase(userRepository, logger, roleRepository);
          },
          inject: [IUserRepository, ILoggerAdapter, IRoleRepository]
        }
      ]
    }).compile();

    usecase = app.get(IRegisterAdapter);
    roleRepository = app.get(IRoleRepository);
    repository = app.get(IUserRepository);
  });

  test('when no input is specified, should expect an error', async () => {
    await expectZodError(
      () => usecase.execute({}, getMockTracing()),
      (issues) => {
        expect(issues).toEqual([
          { message: 'Required', path: UserEntity.nameOf('email') },
          { message: 'Required', path: UserEntity.nameOf('name') },
          { message: 'Required', path: UserEntity.nameOf('username') },
          { message: 'Required', path: UserPasswordEntity.nameOf('password') },
          { message: 'Required', path: UserEntity.nameOf('roles') }
        ]);
      }
    );
  });

  const user = new UserEntity({
    id: getMockUUID(),
    email: 'admin@admin.com',
    name: 'Admin',
    username: 'admin',
    roles: [new RoleEntity({ name: RoleEnum.USER })],
    password: new UserPasswordEntity({ password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918' })
  });

  const input: RegisterInput = {
    email: 'admin@admin.com',
    name: 'Admin',
    username: 'admin',
    roles: [RoleEnum.USER],
    password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'
  };

  const role = new RoleEntity({ name: RoleEnum.USER });

  test('when user role not found, should expect an error', async () => {
    roleRepository.findIn = jest.fn().mockResolvedValue([]);
    repository.findOneWithRelation = jest.fn().mockResolvedValue(null);
    await expect(usecase.execute(input, getMockTracing())).rejects.toThrow(ApiNotFoundException);
  });

  test('when the user is created successfully, should expect an user that has been created', async () => {
    roleRepository.findIn = jest.fn().mockResolvedValue([role]);
    repository.findOneWithRelation = jest.fn().mockResolvedValue(null);
    repository.create = jest.fn().mockResolvedValue(user);
    await expect(usecase.execute(input, getMockTracing())).resolves.toEqual(user);
  });

  test('when user already exists, should expect an error', async () => {
    roleRepository.findIn = jest.fn().mockResolvedValue([role]);
    repository.findOneWithRelation = jest.fn().mockResolvedValue(user);

    await expect(usecase.execute(input, getMockTracing())).rejects.toThrow(ApiConflictException);
  });
});
