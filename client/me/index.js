/**
 * External dependencies
 */

import config from 'calypso/config';
import page from 'page';

/**
 * Internal dependencies
 */
import * as controller from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';

export default function () {
	if ( config.isEnabled( 'me/my-profile' ) ) {
		page( '/me', controller.sidebar, controller.profile, makeLayout, clientRender );

		// Redirect previous URLs
		page( '/me/profile', controller.profileRedirect, makeLayout, clientRender );
		page( '/me/public-profile', controller.profileRedirect, makeLayout, clientRender );
	}

	// Redirect legacy URLs
	page( '/me/trophies', controller.profileRedirect, makeLayout, clientRender );
	page( '/me/find-friends', controller.profileRedirect, makeLayout, clientRender );

	page( '/me/get-apps', controller.sidebar, controller.apps, makeLayout, clientRender );
}
