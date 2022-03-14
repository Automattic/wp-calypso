import { isEnabled } from '@automattic/calypso-config';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import {
	accountRecovery,
	connectedApplications,
	password,
	securityAccountEmail,
	securityCheckup,
	socialLogin,
	twoStep,
} from './controller';

export default function () {
	const mainPageFunction = isEnabled( 'security/security-checkup' ) ? securityCheckup : password;
	page( '/me/security', sidebar, mainPageFunction, makeLayout, clientRender );

	page( '/me/security/account-email', sidebar, securityAccountEmail, makeLayout, clientRender );

	page( '/me/security/password', sidebar, password, makeLayout, clientRender );

	page( '/me/security/social-login', sidebar, socialLogin, makeLayout, clientRender );

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
