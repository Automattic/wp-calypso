import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { isAllowedA4ADashboardHostname } from 'calypso/dashboard/app-a4a/routing';
import { a4aLink } from 'calypso/dashboard/utils/link';
import * as controller from './controller';

export default function () {
	if ( isAllowedA4ADashboardHostname( window.location.hostname ) ) {
		page( '/signup', () => {
			window.location.replace( a4aLink( `/signup${ window.location.search }` ) );
		} );
	} else {
		page(
			'/signup',
			isEnabled( 'a4a-signup-v2' ) ? controller.signupV2Context : controller.signUpContext,
			makeLayout,
			clientRender
		);
	}
	page( '/signup/wc-asia', controller.redirectToSignup );
	page( '/signup/finish', controller.finishSignUpContext, makeLayout, clientRender );
	page( '/signup/oauth/token', controller.tokenRedirect, makeLayout, clientRender );
}
