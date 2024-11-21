import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	setSelectedSiteIdByOrigin,
	redirectLoggedOut,
} from 'calypso/controller';
import * as controller from './controller';

import './style.scss';

export default function () {
	page(
		'/me',
		redirectLoggedOut,
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

	page(
		'/me/get-apps',
		redirectLoggedOut,
		controller.sidebar,
		controller.apps,
		makeLayout,
		clientRender
	);

	page( '/me/*', redirectLoggedOut );
}
