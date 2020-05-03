/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default () => {
	// Always enable the /oauth-login route and redirect to /log-in if `oauth` is disabled
	page( '/oauth-login', controller.oauthLogin, makeLayout, clientRender );

	if ( config.isEnabled( 'oauth' ) ) {
		page( '/authorize', controller.authorize, makeLayout, clientRender );
		page( '/api/oauth/token', controller.getToken, makeLayout, clientRender );
	}
};
