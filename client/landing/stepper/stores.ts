import config from '@automattic/calypso-config';
import { Onboard, Site } from '@automattic/data-stores';

export const ONBOARD_STORE = Onboard.register();
export const SITE_STORE = Site.register( {
	client_id: config( 'wpcom_signup_id' ),
	client_secret: config( 'wpcom_signup_key' ),
} );
