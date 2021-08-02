import { Auth } from '@automattic/data-stores';
import config from '../../../../config';

export const AUTH_STORE = Auth.register( {
	client_id: config( 'wpcom_signup_id' ),
	client_secret: config( 'wpcom_signup_key' ),
} );
