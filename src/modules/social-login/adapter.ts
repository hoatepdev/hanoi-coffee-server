import { Request, Response } from 'express';

import { GoogleLoginOutput } from '@/core/user/use-cases/user-google-login';
import { IUsecase } from '@/utils/usecase';

export abstract class ISocialLoginAdapter implements IUsecase {
  execute(): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  abstract loginGoogle(res: Response<string>): void;
  abstract loginGoogleCallback(res: Response<string>, req: Request): Promise<GoogleLoginOutput>;
}
