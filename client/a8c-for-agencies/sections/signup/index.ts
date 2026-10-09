import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { isAllowedA4ADashboardHostname } from 'calypso/dashboard/app-a4a/routing';
import * as controller from './controller';

// PROTOTYPE: hosts where the `/custom-signup` demo may render.
function isPrototypeHostname( hostname: string ) {
	return (
		hostname === 'localhost' ||
		hostname.endsWith( '.localhost' ) ||
		hostname.endsWith( '.calypso.live' )
	);
}

export default function () {
	const isAllowed = isAllowedA4ADashboardHostname( window.location.hostname );
	page(
		'/signup',
		isEnabled( 'a4a-signup-v2' ) || isAllowed
			? controller.signupV2Context
			: controller.signUpContext,
		makeLayout,
		clientRender
	);
	page( '/signup/wc-asia', controller.redirectToSignup );
	// PROTOTYPE: proof-of-concept signup flow. Viewable while logged in so it can be
	// demoed. Intended to eventually replace the logged-out `/signup` flow.
	// Limited to local dev and Calypso Live previews so it can't surface in production.
	page(
		'/custom-signup',
		isPrototypeHostname( window.location.hostname )
			? controller.customSignupContext
			: controller.redirectToSignup,
		makeLayout,
		clientRender
	);
	page( '/signup/finish', controller.finishSignUpContext, makeLayout, clientRender );
	page( '/signup/oauth/token', controller.tokenRedirect, makeLayout, clientRender );
}
