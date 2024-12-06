import { Request, Response } from 'express';

import { RoleEnum } from '@/core/role/entity/role';
import { IRoleRepository } from '@/core/role/repository/role';
import { IHttpAdapter } from '@/infra/http';
import { ISecretsAdapter } from '@/infra/secrets';
import { ITokenAdapter } from '@/libs/token';
import { ISocialLoginAdapter } from '@/modules/social-login/adapter';
import { ApiNotFoundException } from '@/utils/exception';

import { UserEntity } from '../entity/user';
import { UserPasswordEntity } from '../entity/user-password';
import { IUserRepository } from '../repository/user';

export type GoogleLoginOutput = void;

export class GoogleLoginUsecase implements ISocialLoginAdapter {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenAdapter,
    private readonly secret: ISecretsAdapter,
    private readonly http: IHttpAdapter,
    private readonly roleRepository: IRoleRepository
  ) {}

  loginGoogle(res: Response): void {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.secret.AUTH.GOOGLE.CLIENT_ID}&redirect_uri=${this.secret.AUTH.GOOGLE.REDIRECT_URL}&response_type=code&scope=profile email`;
    res.redirect(url);
  }

  async loginGoogleCallback(res: Response, req: Request): Promise<void> {
    const { code } = req.query;
    // console.log('code', code);

    const http = this.http.instance();

    const { data } = await http.post('https://oauth2.googleapis.com/token', {
      client_id: this.secret.AUTH.GOOGLE.CLIENT_ID,
      client_secret: this.secret.AUTH.GOOGLE.CLIENT_SECRET,
      code,
      redirect_uri: this.secret.AUTH.GOOGLE.REDIRECT_URL,
      grant_type: 'authorization_code'
    });

    const { access_token } = data;

    const { data: profile } = await http.get<{ name: string; email: string }>(
      'https://www.googleapis.com/oauth2/v1/userinfo',
      {
        headers: { Authorization: `Bearer ${access_token}` }
      }
    );

    const user = await this.userRepository.findOneWithRelation([{ email: profile.email }], { password: true });
    // console.log('useruser', user);

    if (!user) {
      // console.log('user not found', profile);

      const roles = await this.roleRepository.findIn({ name: [RoleEnum.USER] });

      if (roles.length < 1) {
        throw new ApiNotFoundException('roleNotFound');
      }

      const userEntity = new UserEntity({
        name: profile.name,
        email: profile.email,
        username: `${profile.email.split('@')[0]}_${Math.floor(Date.now() / 1000)}`,
        roles
      });
      const passwordEntity = new UserPasswordEntity({ password: Math.random().toString(36).slice(-8) });
      passwordEntity.createPassword();
      userEntity.password = passwordEntity;
      // console.log('userEntityuserEntity', userEntity);
      await this.userRepository.create(userEntity);

      // const tokenNewPassword = this.tokenService.sign({
      //   email: profile.email,
      //   name: profile.name
      // });
      // res.redirect(`/create-new-password=${tokenNewPassword.token}`);
      // const foundUser = await this.userRepository.findOneWithRelation([{ email: newUser.id }], { password: true });
    }

    this.tokenService.sign({
      email: user.email,
      name: profile.name,
      roles: user.roles.map((r) => r.name)
    });

    // res.redirect(`/home?token=${tokenAuthorization.token}`);
  }

  async execute(): Promise<unknown> {
    // console.log('input', input);
    throw new Error('Method not implemented.');
  }
}
