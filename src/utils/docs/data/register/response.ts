import { RegisterOutput } from '@/core/user/use-cases/user-register';
import { getMockUUID } from '@/utils/tests';

export const RegisterResponse = {
  create: { created: true, id: getMockUUID() } as RegisterOutput
};
