import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import * as controller from './controller';

export default function () {
	page( '/signup', controller.signUpContext, makeLayout, clientRender );
	page( '/signup/finish', controller.finishSignUpContext, makeLayout, clientRender );
	if ( isEnabled( 'a4a-wc-asia-signup-enabled' ) ) {
		page( '/signup/wc-asia', controller.wcAsiaSignupContext, makeLayout, clientRender );
	}
	page( '/signup/oauth/token', controller.tokenRedirect, makeLayout, clientRender );
}
