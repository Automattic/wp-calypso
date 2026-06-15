import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { isAllowedA4ADashboardHostname } from 'calypso/dashboard/app-a4a/routing';
import * as controller from './controller';

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
	page( '/signup/wc-asia', controller.signupWCAsiaContext, makeLayout, clientRender );
	page( '/signup/finish', controller.finishSignUpContext, makeLayout, clientRender );
	page( '/signup/oauth/token', controller.tokenRedirect, makeLayout, clientRender );
}
