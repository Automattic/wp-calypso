import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { sidebar } from 'calypso/me/controller';
import {
	accountRecovery,
	connectedApplications,
	password,
	securityAccountEmail,
	securityCheckup,
	socialLogin,
	sshKey,
	twoStep,
} from './controller';

export default function () {
	const mainPageFunction = isEnabled( 'security/security-checkup' ) ? securityCheckup : password;
	page(
		'/me/security',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/security' ),
		sidebar,
		mainPageFunction,
		makeLayout,
		clientRender
	);

	page(
		'/me/security/account-email',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/security/profile' ),
		sidebar,
		securityAccountEmail,
		makeLayout,
		clientRender
	);

	page(
		'/me/security/password',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/security/password' ),
		sidebar,
		password,
		makeLayout,
		clientRender
	);

	page(
		'/me/security/social-login',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/security/social-logins' ),
		sidebar,
		socialLogin,
		makeLayout,
		clientRender
	);

	page(
		'/me/security/two-step',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/security/two-step-auth' ),
		sidebar,
		twoStep,
		makeLayout,
		clientRender
	);

	page(
		'/me/security/connected-applications',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/security/connected-apps' ),
		sidebar,
		connectedApplications,
		makeLayout,
		clientRender
	);

	page(
		'/me/security/account-recovery',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/security/account-recovery' ),
		sidebar,
		accountRecovery,
		makeLayout,
		clientRender
	);

	page(
		'/me/security/ssh-key',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/security/ssh-key' ),
		sidebar,
		sshKey,
		makeLayout,
		clientRender
	);
}
