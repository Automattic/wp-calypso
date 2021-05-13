/**
 * External dependencies
 */
import { User } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';

export const USER_STORE = User.register( {
	client_id: config( 'wpcom_signup_id' ),
	client_secret: config( 'wpcom_signup_key' ),
} );
