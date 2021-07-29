import config from '@automattic/calypso-config';
import { User } from '@automattic/data-stores';

export const USER_STORE = User.register( {
	client_id: config( 'wpcom_signup_id' ),
	client_secret: config( 'wpcom_signup_key' ),
} );
