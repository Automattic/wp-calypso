/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'controller';
import { sidebar } from 'me/controller';
import {
	accountRecovery,
	connectedApplications,
	password,
	socialLogin,
	twoStep,
} from './controller';

export default function() {
	page( '/me/security', redirectLoggedOut, sidebar, password, makeLayout, clientRender );
	page( '/me/security/*', redirectLoggedOut );

	if ( config.isEnabled( 'signup/social-management' ) ) {
		page( '/me/security/social-login', sidebar, socialLogin, makeLayout, clientRender );
	}

	page( '/me/security/two-step', sidebar, twoStep, makeLayout, clientRender );

	page(
		'/me/security/connected-applications',
		sidebar,
		connectedApplications,
		makeLayout,
		clientRender
	);

	page( '/me/security/account-recovery', sidebar, accountRecovery, makeLayout, clientRender );
}
