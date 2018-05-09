/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import * as controller from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';
import { sidebar } from 'me/controller';

export default function() {
	page( '/me/security', sidebar, controller.password, makeLayout, clientRender );

	if ( config.isEnabled( 'signup/social-management' ) ) {
		page( '/me/security/social-login', sidebar, controller.socialLogin, makeLayout, clientRender );
	}

	page( '/me/security/two-step', sidebar, controller.twoStep, makeLayout, clientRender );

	page(
		'/me/security/connected-applications',
		sidebar,
		controller.connectedApplications,
		makeLayout,
		clientRender
	);

	page(
		'/me/security/account-recovery',
		sidebar,
		controller.accountRecovery,
		makeLayout,
		clientRender
	);
}
