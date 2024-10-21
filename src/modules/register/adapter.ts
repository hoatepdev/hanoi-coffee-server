import { RegisterInput, RegisterOutput } from '@/core/user/use-cases/user-register';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';

export abstract class IRegisterAdapter implements IUsecase {
  abstract execute(input: RegisterInput, trace: ApiTrancingInput): Promise<RegisterOutput>;
}
