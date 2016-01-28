/**
 * External dependencies
 */
const page = require( 'page' );

/**
 * Internal dependencies
 */
const controller = require( 'my-sites/controller' ),
	upgradesController = require( './controller' ),
	domainManagementController = require( './domain-management/controller' ),
	SiftScience = require( 'lib/siftscience' ),
	config = require( 'config' ),
	paths = require( './paths' ),
	adTracking = require( 'analytics/ad-tracking' );

module.exports = function() {
	SiftScience.recordUser();

	if ( config.isEnabled( 'upgrades/domain-management/list' ) ) {
		page(
			paths.domainManagementRoot(),
			controller.siteSelection,
			controller.sites
		);

		page(
			paths.domainManagementList( ':site' ),
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
			controller.jetPackWarning,
			domainManagementController.domainManagementList
		);

		page(
			paths.domainManagementEdit( ':site', ':domain' ),
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
			controller.jetPackWarning,
			domainManagementController.domainManagementEdit
		);

		page(
			paths.domainManagementPrivacyProtection( ':site', ':domain' ),
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
			domainManagementController.domainManagementPrivacyProtection
		);

		page(
			paths.domainManagementPrimaryDomain( ':site', ':domain' ),
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
			controller.jetPackWarning,
			domainManagementController.domainManagementPrimaryDomain
		);
	}

	if ( config.isEnabled( 'upgrades/domain-management/email' ) ) {
		page(
			paths.domainManagementEmail( ':site', ':domain' ),
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
			controller.jetPackWarning,
			domainManagementController.domainManagementEmail
		);

		page(
			paths.domainManagementEmail( ':site' ),
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
			controller.jetPackWarning,
			domainManagementController.domainManagementEmail
		);

		page(
			paths.domainManagementAddGoogleApps( ':site', ':domain' ),
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
			controller.jetPackWarning,
			domainManagementController.domainManagementAddGoogleApps
		);

		page(
			paths.domainManagementAddGoogleApps( ':site' ),
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
			controller.jetPackWarning,
			domainManagementController.domainManagementAddGoogleApps
		);

		page(
			paths.domainManagementEmailForwarding( ':site', ':domain' ),
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
			controller.jetPackWarning,
			domainManagementController.domainManagementEmailForwarding
		);
	}

	if ( config.isEnabled( 'upgrades/domain-management/site-redirect' ) ) {
		page(
			paths.domainManagementRedirectSettings( ':site', ':domain' ),
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
			controller.jetPackWarning,
			domainManagementController.domainManagementRedirectSettings
		);
	}

	if ( config.isEnabled( 'upgrades/domain-management/contacts-privacy' ) ) {
		page(
			paths.domainManagementContactsPrivacy( ':site', ':domain' ),
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
			controller.jetPackWarning,
			domainManagementController.domainManagementContactsPrivacy
		);

		page(
			paths.domainManagementEditContactInfo( ':site', ':domain' ),
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
			controller.jetPackWarning,
			domainManagementController.domainManagementEditContactInfo
		);
	}

	if ( config.isEnabled( 'upgrades/domain-management/name-servers' ) ) {
		page(
			paths.domainManagementDns( ':site', ':domain' ),
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
			controller.jetPackWarning,
			domainManagementController.domainManagementDns
		);

		page(
			paths.domainManagementNameServers( ':site', ':domain' ),
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
			controller.jetPackWarning,
			domainManagementController.domainManagementNameServers
		);
	}

	page(
		paths.domainManagementTransfer( ':site', ':domain' ),
		controller.siteSelection,
		controller.navigation,
		upgradesController.redirectIfNoSite( paths.domainManagementRoot() ),
		controller.jetPackWarning,
		domainManagementController.domainManagementTransfer
	);

	if ( config.isEnabled( 'upgrades/domain-search' ) ) {
		page(
			'/domains/add',
			adTracking.retarget,
			controller.siteSelection,
			upgradesController.domainsAddHeader,
			controller.jetPackWarning,
			controller.sites
		);

		page(
			'/domains/add/mapping',
			adTracking.retarget,
			controller.siteSelection,
			upgradesController.domainsAddHeader,
			controller.jetPackWarning,
			controller.sites
		);

		page(
			'/domains/add/site-redirect',
			adTracking.retarget,
			controller.siteSelection,
			upgradesController.domainsAddRedirectHeader,
			controller.jetPackWarning,
			controller.sites
		);

		page( '/domains/add/:domain',
			adTracking.retarget,
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( '/domains/add' ),
			controller.jetPackWarning,
			upgradesController.domainSearch
		);

		page( '/domains/add/suggestion/:suggestion/:domain',
			adTracking.retarget,
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( '/domains/add' ),
			controller.jetPackWarning,
			upgradesController.domainSearch
		);

		page( '/domains/add/:registerDomain/google-apps/:domain',
			adTracking.retarget,
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( '/domains/add' ),
			controller.jetPackWarning,
			upgradesController.googleAppsWithRegistration
		);

		page( '/domains/add/mapping/:domain',
			adTracking.retarget,
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( '/domains/add/mapping' ),
			controller.jetPackWarning,
			upgradesController.mapDomain
		);

		page( '/domains/add/site-redirect/:domain',
			adTracking.retarget,
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( '/domains/add/site-redirect' ),
			controller.jetPackWarning,
			upgradesController.siteRedirect
		);
	}

	if ( config.isEnabled( 'upgrades/domain-management/list' ) ) {
		page(
			'/domains',
			controller.siteSelection,
			controller.sites
		);

		page(
			'/domains/:site',
			controller.siteSelection,
			controller.navigation,
			controller.jetPackWarning,
			domainManagementController.domainManagementIndex
		);
	} else {
		page(
			'/domains',
			adTracking.retarget,
			controller.siteSelection,
			upgradesController.domainsAddHeader,
			controller.jetPackWarning,
			controller.sites
		);

		page( '/domains/:domain',
			adTracking.retarget,
			controller.siteSelection,
			controller.navigation,
			controller.jetPackWarning,
			upgradesController.domainSearchIndex
		);
	}

	if ( config.isEnabled( 'upgrades/checkout' ) ) {
		page(
			'/checkout/thank-you',
			upgradesController.redirectIfThemePurchased,
			upgradesController.checkoutThankYou
		);

		page(
			'/checkout/:domain/:plan_name?',
			adTracking.retarget,
			controller.siteSelection,
			upgradesController.checkout
		);
	}
};
