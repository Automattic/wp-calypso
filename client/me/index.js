/**
 * External dependencies
 */
import config from 'config';
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';

export default function() {
	if ( config.isEnabled( 'me/my-profile' ) ) {
		page( '/me', controller.sidebar, controller.profile );
		page( '/me/account', controller.sidebar, controller.account );

		// Redirect previous URLs
		page( '/me/profile', controller.profileRedirect );
		page( '/me/public-profile', controller.profileRedirect );
	}

	if ( config.isEnabled( 'me/next-steps' ) ) {
		page( '/me/next/:welcome?', controller.sidebar, controller.nextStepsWelcomeRedirect, controller.nextSteps );
	}

	if ( config.isEnabled( 'me/security' ) ) {
		page( '/me/security', controller.sidebar, controller.password );
		page( '/me/security/two-step', controller.sidebar, controller.twoStep );
		page( '/me/security/connected-applications', controller.sidebar, controller.connectedApplications );
		page( '/me/security/connected-applications/:application_id', controller.sidebar, controller.connectedApplication );
		if ( config.isEnabled( 'me/security/checkup' ) ) {
			page( '/me/security/checkup', controller.sidebar, controller.securityCheckup );
		}
	}

	// Trophies and Find-Friends only exist in Atlas
	// Using a reverse config flag here to try to reflect that
	// If they're "not enabled", then the router should not redirect them, so they will be handled in Atlas
	if ( ! config.isEnabled( 'me/trophies' ) ) {
		page( '/me/trophies', controller.trophiesRedirect );
	}

	if ( ! config.isEnabled( 'me/find-friends' ) ) {
		page( '/me/find-friends', controller.findFriendsRedirect );
	}

	page( '/me/notifications', controller.sidebar, controller.notifications );
	page( '/me/notifications/comments', controller.sidebar, controller.comments );
	page( '/me/notifications/updates', controller.sidebar, controller.updates );
	page( '/me/notifications/subscriptions', controller.sidebar, controller.notificationSubscriptions );
	page( '/me/get-apps', controller.sidebar, controller.apps );
};
