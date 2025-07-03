import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender, setSelectedSiteIdByOrigin } from 'calypso/controller';
import * as controller from './controller';

import './style.scss';

export default function () {
	page(
		'/me',
		controller.sidebar,
		setSelectedSiteIdByOrigin,
		controller.profile,
		makeLayout,
		clientRender
	);

	// Redirect previous URLs
	page( '/me/profile', controller.profileRedirect, makeLayout, clientRender );
	page( '/me/public-profile', controller.profileRedirect, makeLayout, clientRender );

	// Redirect legacy URLs
	page( '/me/trophies', controller.profileRedirect, makeLayout, clientRender );
	page( '/me/find-friends', controller.profileRedirect, makeLayout, clientRender );

	page( '/me/get-apps', controller.sidebar, controller.apps, makeLayout, clientRender );

	// /help page has been dismissed
	if ( config.isEnabled( 'help' ) ) {
		page( '/help', controller.helpRedirect, makeLayout, clientRender );
		page( '/help/contact', controller.helpRedirect, makeLayout, clientRender );
	}

	page( '/me/chat', controller.helpRedirect, makeLayout, clientRender );
}
