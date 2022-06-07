import { HelpCenter, User } from '@automattic/data-stores';

export const STORE_KEY = HelpCenter.register();
export const USER_KEY = User.register( { client_id: '', client_secret: '' } );
