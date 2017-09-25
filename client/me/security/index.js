/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import config from 'config';
import meController from 'me/controller';

export default function() {
	page( '/me/security', meController.sidebar, controller.password );

	if ( config.isEnabled( 'signup/social-management' ) ) {
		page( '/me/security/social-login', meController.sidebar, controller.socialLogin );
	}

	page( '/me/security/two-step', meController.sidebar, controller.twoStep );
	page( '/me/security/connected-applications', meController.sidebar, controller.connectedApplications );
	page( '/me/security/connected-applications/:application_id', meController.sidebar, controller.connectedApplication );
	page( '/me/security/account-recovery', meController.sidebar, controller.accountRecovery );
}
