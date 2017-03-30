/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';

import { makeLayout, render as clientRender } from 'controller';

module.exports = function() {
	if ( config.isEnabled( 'oauth' ) ) {
		page('/login', controller.login, makeLayout, clientRender);
		page('/authorize', controller.authorize, makeLayout, clientRender);
		page('/api/oauth/token', controller.getToken, makeLayout, clientRender);
	}
};
