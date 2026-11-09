import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { isAllowedA4ADashboardHostname } from 'calypso/dashboard/app-a4a/routing';
import * as controller from './controller';

export default function () {
	const isAllowed = isAllowedA4ADashboardHostname( window.location.hostname );

	// Signup on the new dashboard isn't ready yet, so send agencies to the classic one.
	if ( isAllowed ) {
		page( '/signup', () => {
			window.location.replace(
				`https://agencies.automattic.com/signup${ window.location.search }`
			);
		} );
	}

	page(
		'/signup',
		isEnabled( 'a4a-signup-v2' ) || isAllowed
			? controller.signupV2Context
			: controller.signUpContext,
		makeLayout,
		clientRender
	);
	page( '/signup/wc-asia', controller.redirectToSignup );
	page( '/signup/finish', controller.finishSignUpContext, makeLayout, clientRender );
	page( '/signup/oauth/token', controller.tokenRedirect, makeLayout, clientRender );
}
