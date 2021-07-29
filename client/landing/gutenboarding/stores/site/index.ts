import config from '@automattic/calypso-config';
import { Site } from '@automattic/data-stores';

export const SITE_STORE = Site.register( {
	client_id: config( 'wpcom_signup_id' ),
	client_secret: config( 'wpcom_signup_key' ),
} );
