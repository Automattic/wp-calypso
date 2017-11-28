/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';

export default () => {
	// Always enable the /oauth-login route and redirect to /log-in if `oauth` is disabled
	page( '/oauth-login', controller.oauthLogin );

	if ( config.isEnabled( 'oauth' ) ) {
		page( '/authorize', controller.authorize );
		page( '/api/oauth/token', controller.getToken );
	}
};
