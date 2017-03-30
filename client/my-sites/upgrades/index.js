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
	paths = require( './paths' );

function registerMultiPage( { paths, handlers } ) {
	paths.forEach( path => page(path, ...handlers, makeLayout, clientRender) );
}

function getCommonHandlers( { noSitePath = paths.domainManagementRoot(), warnIfJetpack = true } = {} ) {
	const handlers = [
		controller.siteSelection,
		controller.navigation
	];

	if ( noSitePath ) {
		handlers.push( upgradesController.redirectIfNoSite( noSitePath ) );
	}

	if ( warnIfJetpack ) {
		handlers.push( controller.jetPackWarning );
	}

	return handlers;
}

module.exports = function() {
	SiftScience.recordUser();

	page(
	    paths.domainManagementEmail(),
		controller.siteSelection,
		controller.sites,
		makeLayout,
		clientRender
	);

	registerMultiPage( {
		paths: [
			paths.domainManagementEmail( ':site', ':domain' ),
			paths.domainManagementEmail( ':site' )
		],
		handlers: [
			...getCommonHandlers( { noSitePath: paths.domainManagementEmail() } ),
			domainManagementController.domainManagementEmail
		]
	} );

	registerMultiPage( {
		paths: [
			paths.domainManagementAddGoogleApps( ':site', ':domain' ),
			paths.domainManagementAddGoogleApps( ':site' )
		],
		handlers: [
			...getCommonHandlers(),
			domainManagementController.domainManagementAddGoogleApps
		]
	} );

	page(
	    paths.domainManagementEmailForwarding( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementEmailForwarding,
		makeLayout,
		clientRender
	);

	page(
	    paths.domainManagementRedirectSettings( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementRedirectSettings,
		makeLayout,
		clientRender
	);

	page(
	    paths.domainManagementContactsPrivacy( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementContactsPrivacy,
		makeLayout,
		clientRender
	);

	page(
	    paths.domainManagementEditContactInfo( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementEditContactInfo,
		makeLayout,
		clientRender
	);

	page(
	    paths.domainManagementDns( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementDns,
		makeLayout,
		clientRender
	);

	page(
	    paths.domainManagementNameServers( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementNameServers,
		makeLayout,
		clientRender
	);

	page(
	    paths.domainManagementTransfer( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementTransfer,
		makeLayout,
		clientRender
	);

	page(
	    paths.domainManagementTransferOut( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementTransferOut,
		makeLayout,
		clientRender
	);

	page(
	    paths.domainManagementTransferToAnotherUser( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementTransferToOtherUser,
		makeLayout,
		clientRender
	);

	page(
	    paths.domainManagementRoot(),
		controller.siteSelection,
		controller.sites,
		makeLayout,
		clientRender
	);

	page(
	    paths.domainManagementList( ':site' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementList,
		makeLayout,
		clientRender
	);

	page(
	    paths.domainManagementEdit( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementEdit,
		makeLayout,
		clientRender
	);

	page(
	    paths.domainManagementPrivacyProtection( ':site', ':domain' ),
		...getCommonHandlers( { warnIfJetpack: false } ),
		domainManagementController.domainManagementPrivacyProtection,
		makeLayout,
		clientRender
	);

	page(
	    paths.domainManagementPrimaryDomain( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementPrimaryDomain,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'upgrades/domain-search' ) ) {
		page(
		    '/domains/add',
			controller.siteSelection,
			upgradesController.domainsAddHeader,
			upgradesController.redirectToAddMappingIfVipSite(),
			controller.jetPackWarning,
			controller.sites,
			makeLayout,
			clientRender
		);

		page(
		    '/domains/add/mapping',
			controller.siteSelection,
			upgradesController.domainsAddHeader,
			controller.jetPackWarning,
			controller.sites,
			makeLayout,
			clientRender
		);

		page(
		    '/domains/add/site-redirect',
			controller.siteSelection,
			upgradesController.domainsAddRedirectHeader,
			controller.jetPackWarning,
			controller.sites,
			makeLayout,
			clientRender
		);

		page(
		    '/domains/add/:domain',
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( '/domains/add' ),
			upgradesController.redirectToAddMappingIfVipSite(),
			controller.jetPackWarning,
			upgradesController.domainSearch,
			makeLayout,
			clientRender
		);

		page(
		    '/domains/add/suggestion/:suggestion/:domain',
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( '/domains/add' ),
			upgradesController.redirectToAddMappingIfVipSite(),
			controller.jetPackWarning,
			upgradesController.domainSearch,
			makeLayout,
			clientRender
		);

		page(
		    '/domains/add/:registerDomain/google-apps/:domain',
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( '/domains/add' ),
			controller.jetPackWarning,
			upgradesController.googleAppsWithRegistration,
			makeLayout,
			clientRender
		);

		page(
		    '/domains/add/mapping/:domain',
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( '/domains/add/mapping' ),
			controller.jetPackWarning,
			upgradesController.mapDomain,
			makeLayout,
			clientRender
		);

		page(
		    '/domains/add/site-redirect/:domain',
			controller.siteSelection,
			controller.navigation,
			upgradesController.redirectIfNoSite( '/domains/add/site-redirect' ),
			controller.jetPackWarning,
			upgradesController.siteRedirect,
			makeLayout,
			clientRender
		);
	}

	page(
	    '/domains',
		controller.siteSelection,
		controller.sites,
		makeLayout,
		clientRender
	);

	page(
	    '/domains/:site',
		controller.siteSelection,
		controller.navigation,
		controller.jetPackWarning,
		domainManagementController.domainManagementIndex,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'upgrades/checkout' ) ) {
		page(
		    '/checkout/thank-you/no-site/:receiptId?',
			upgradesController.checkoutThankYou,
			makeLayout,
			clientRender
		);

		page(
		    '/checkout/thank-you/:site/:receiptId?',
			controller.siteSelection,
			upgradesController.checkoutThankYou,
			makeLayout,
			clientRender
		);

		page(
		    '/checkout/features/:feature/:domain/:plan_name?',
			controller.siteSelection,
			upgradesController.checkout,
			makeLayout,
			clientRender
		);

		page(
		    '/checkout/thank-you/features/:feature/:site/:receiptId?',
			controller.siteSelection,
			upgradesController.checkoutThankYou,
			makeLayout,
			clientRender
		);

		page(
		    '/checkout/no-site',
			upgradesController.sitelessCheckout,
			makeLayout,
			clientRender
		);

		page(
		    '/checkout/:domain/:product?',
			controller.siteSelection,
			upgradesController.checkout,
			makeLayout,
			clientRender
		);

		// Visting /checkout without a plan or product should be redirected to /plans
		page('/checkout', '/plans', makeLayout, clientRender);
	}
};
