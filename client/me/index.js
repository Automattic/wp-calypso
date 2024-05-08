import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import * as controller from './controller';

import './dotcom-nav-redesign-v2.scss';

export default function () {
	page( '/me', controller.sidebar, controller.profile, makeLayout, clientRender );

	// Redirect previous URLs
	page( '/me/profile', controller.profileRedirect, makeLayout, clientRender );
	page( '/me/public-profile', controller.profileRedirect, makeLayout, clientRender );

	// Redirect legacy URLs
	page( '/me/trophies', controller.profileRedirect, makeLayout, clientRender );
	page( '/me/find-friends', controller.profileRedirect, makeLayout, clientRender );

	page( '/me/get-apps', controller.sidebar, controller.apps, makeLayout, clientRender );
}
