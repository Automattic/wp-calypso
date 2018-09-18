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

	if ( config.isEnabled( 'signup/social-management' ) ) {
		page(
			'/me/security/social-login',
			redirectLoggedOut,
			sidebar,
			socialLogin,
			makeLayout,
			clientRender
		);
	}

	page( '/me/security/two-step', redirectLoggedOut, sidebar, twoStep, makeLayout, clientRender );

	page(
		'/me/security/connected-applications',
		redirectLoggedOut,
		sidebar,
		connectedApplications,
		makeLayout,
		clientRender
	);

	page(
		'/me/security/account-recovery',
		redirectLoggedOut,
		sidebar,
		accountRecovery,
		makeLayout,
		clientRender
	);
}
