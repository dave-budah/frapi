import { Request } from 'express';
import { User } from '@app/user/entities/user.entity';

export interface ExpressRequestInterface extends Request {
  user?: User;
}
