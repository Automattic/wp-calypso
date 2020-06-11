/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';
import { sidebar } from 'me/controller';
import {
	accountRecovery,
	connectedApplications,
	password,
	securityCheckup,
	socialLogin,
	twoStep,
} from './controller';

export default function () {
	page( '/me/security', sidebar, password, makeLayout, clientRender );

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

	if ( config.isEnabled( 'security/security-checkup' ) ) {
		page( '/me/security/security-checkup', sidebar, securityCheckup, makeLayout, clientRender );
	}
}
