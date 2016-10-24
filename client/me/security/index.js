/**
 * External dependencies
 */
import config from 'config';
import page from 'page';

/**
 * Internal dependencies
 */
import meController from 'me/controller';
import controller from './controller';

export default function() {
	if ( config.isEnabled( 'me/security' ) ) {
		page( '/me/security', meController.sidebar, controller.password );
		page( '/me/security/two-step', meController.sidebar, controller.twoStep );
		page( '/me/security/connected-applications', meController.sidebar, controller.connectedApplications );
		page( '/me/security/connected-applications/:application_id', meController.sidebar, controller.connectedApplication );
	}

	if ( config.isEnabled( 'me/security/checkup' ) ) {
		page( '/me/security/checkup', meController.sidebar, controller.securityCheckup );
	}
};
