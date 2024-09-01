import { User } from '@app/user/entities/user.entity';

export type UserType = Omit<User, 'hashPassword'>;
