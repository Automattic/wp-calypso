/**
 * External dependencies
 */
import config from 'config';
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import removeOverlay from 'remove-overlay';
import paths from './paths';

export default function() {
	if ( config.isEnabled( 'me/my-profile' ) ) {
		page( '/me', controller.sidebar, controller.profile );
		page( '/me/account', controller.sidebar, controller.account );

		// Redirect previous URLs
		page( '/me/profile', controller.profileRedirect );
		page( '/me/public-profile', controller.profileRedirect );
	}

	if ( config.isEnabled( 'me/billing-history' ) ) {
		page( '/me/billing', removeOverlay, controller.sidebar, controller.billingHistory );
		page( '/me/billing/:transaction_id', controller.sidebar, controller.billingHistory );
	}

	page(
		paths.purchases.cancelPurchase(),
		controller.sidebar,
		controller.purchases.noSitesMessage,
		controller.purchases.cancelPurchase
	);

	page(
		paths.purchases.cancelPrivateRegistration(),
		controller.sidebar,
		controller.purchases.noSitesMessage,
		controller.purchases.cancelPrivateRegistration
	);

	page(
		paths.purchases.confirmCancelPurchase(),
		controller.sidebar,
		controller.purchases.noSitesMessage,
		controller.purchases.confirmCancelPurchase
	);

	page(
		paths.purchases.editCardDetails(),
		controller.sidebar,
		controller.purchases.noSitesMessage,
		controller.purchases.editCardDetails
	);

	page(
		paths.purchases.list(),
		controller.sidebar,
		controller.purchases.noSitesMessage,
		controller.purchases.list
	);

	page(
		paths.purchases.listNotice(),
		controller.sidebar,
		controller.purchases.noSitesMessage,
		controller.purchases.list
	);

	page(
		paths.purchases.managePurchase(),
		controller.sidebar,
		controller.purchases.noSitesMessage,
		controller.purchases.managePurchase
	);

	page(
		paths.purchases.managePurchaseDestination(),
		controller.sidebar,
		controller.purchases.noSitesMessage,
		controller.purchases.managePurchase
	);

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
};
