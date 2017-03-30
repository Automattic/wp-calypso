/**
 * External dependencies
 */
import config from 'config';
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';

import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( config.isEnabled( 'me/my-profile' ) ) {
		page('/me', controller.sidebar, controller.profile, makeLayout, clientRender);

		// Redirect previous URLs
		page('/me/profile', controller.profileRedirect, makeLayout, clientRender);
		page('/me/public-profile', controller.profileRedirect, makeLayout, clientRender);
	}

	if ( config.isEnabled( 'me/next-steps' ) ) {
		page(
		    '/me/next/:welcome?',
			controller.sidebar,
			controller.nextStepsWelcomeRedirect,
			controller.nextSteps,
			makeLayout,
			clientRender
		);
	}

	// Trophies and Find-Friends only exist in Atlas
	// Using a reverse config flag here to try to reflect that
	// If they're "not enabled", then the router should not redirect them, so they will be handled in Atlas
	if ( ! config.isEnabled( 'me/trophies' ) ) {
		page('/me/trophies', controller.trophiesRedirect, makeLayout, clientRender);
	}

	if ( ! config.isEnabled( 'me/find-friends' ) ) {
		page(
		    '/me/find-friends',
			controller.findFriendsRedirect,
			makeLayout,
			clientRender
		);
	}

	page(
	    '/me/get-apps',
		controller.sidebar,
		controller.apps,
		makeLayout,
		clientRender
	);
}
