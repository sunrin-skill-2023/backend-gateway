import { IUser as UserValue } from 'shared/src/generated/auth.proto';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface User extends UserValue {}
  }
}
