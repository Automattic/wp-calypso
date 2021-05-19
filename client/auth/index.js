/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { storeToken } from './controller';

export default () => {
	if ( config.isEnabled( 'oauth' ) ) {
		page( '/api/oauth/token', storeToken );
	}
};
