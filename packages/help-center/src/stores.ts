/**
 * External Dependencies
 */
import config from '@automattic/calypso-config';
import { HelpCenter, User, Site } from '@automattic/data-stores';

export const HELP_CENTER_STORE = HelpCenter.register();

// these creds are only needed when signing up users
export const USER_STORE = User.register( {
	client_id: config( 'wpcom_signup_id' ),
	client_secret: config( 'wpcom_signup_key' ),
} );
export const SITE_STORE = Site.register( {
	client_id: config( 'wpcom_signup_id' ),
	client_secret: config( 'wpcom_signup_key' ),
} );
