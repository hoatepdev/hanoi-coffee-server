import { z } from 'zod';

import { RoleEnum } from '@/core/role/entity/role';
import { IRoleRepository } from '@/core/role/repository/role';
import { ITokenAdapter } from '@/libs/token';
import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { ApiTrancingInput, UserRequest } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';

import { UserEntity, UserEntitySchema } from '../entity/user';
import { UserPasswordEntity, UserPasswordEntitySchema } from '../entity/user-password';
import { IUserRepository } from '../repository/user';

export const RegisterSchema = UserEntitySchema.pick({
  email: true,
  name: true,
  username: true
})
  .merge(UserPasswordEntitySchema.pick({ password: true }))
  .merge(z.object({ roles: z.array(z.nativeEnum(RoleEnum)).min(1) }));

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type RegisterOutput = { accessToken: string; refreshToken: string };

export class RegisterUsecase implements IUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenAdapter,
    private readonly roleRepository: IRoleRepository
  ) {}

  @ValidateSchema(RegisterSchema)
  async execute(input: RegisterInput, { tracing }: ApiTrancingInput): Promise<RegisterOutput> {
    const userExists = await this.userRepository.findOneWithRelation(
      [
        {
          email: input.email
        },
        { username: input.username }
      ],
      { password: true }
    );

    if (userExists) {
      throw new ApiNotFoundException('userExists');
    }

    const roles = await this.roleRepository.findIn({ name: input.roles });

    if (roles.length < input.roles.length) {
      throw new ApiNotFoundException('roleNotFound');
    }

    const userEntity = new UserEntity({ name: input.name, email: input.email, username: input.username, roles: roles });

    const passwordEntity = new UserPasswordEntity({ password: input.password });

    passwordEntity.createPassword();

    userEntity.password = passwordEntity;

    const newUser = await this.userRepository.create(userEntity);

    tracing.logEvent('user-login', `${newUser}`);

    const { token } = this.tokenService.sign({
      email: userEntity.email,
      name: userEntity.name,
      roles: userEntity.roles.map((r) => r.name)
    } as UserRequest);

    const { token: refreshToken } = this.tokenService.sign({ userId: newUser.id });

    return { accessToken: token, refreshToken };
  }
}
