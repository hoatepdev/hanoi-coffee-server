import { RegisterInput } from '@/core/user/use-cases/user-register';
import { RegisterResponse } from '@/utils/docs/data/register/response';
import { Swagger } from '@/utils/docs/swagger';

const BASE_URL = `api/v1`;

export const SwaggerResponse = {
  register: {
    200: Swagger.defaultResponseJSON({
      status: 200,
      json: RegisterResponse.create,
      description: 'user register.'
    }),
    404: Swagger.defaultResponseWithMultiplesError({
      messages: {
        'user not found': { value: ['userNotFound'], description: 'user not found' },
        'role not found': { value: ['roleNotFound'], description: 'user role not found' }
      },
      route: BASE_URL.concat('/register'),
      status: 404
    })
  }
};

export const SwaggerRequest = {
  register: Swagger.defaultRequestJSON({
    email: 'admin@admin.com',
    name: 'admin',
    password: 'admin',
    username: 'admin',
    roles: ['USER']
  } as RegisterInput)
};
