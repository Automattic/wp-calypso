/**
 * External dependencies
 */
import { Site } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import config from '../../../../config';

export const SITE_STORE = Site.register( {
	client_id: config( 'wpcom_signup_id' ),
	client_secret: config( 'wpcom_signup_key' ),
} );
