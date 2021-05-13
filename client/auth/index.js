/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { oauthLogin, storeToken } from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';

export default () => {
	// Always enable the /oauth-login route and redirect to /log-in if `oauth` is disabled
	page( '/oauth-login', oauthLogin, makeLayout, clientRender );

	if ( config.isEnabled( 'oauth' ) ) {
		page( '/api/oauth/token', storeToken );
	}
};
