/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from 'my-sites/controller';
import domainsController from './controller';
import domainManagementController from './domain-management/controller';
import SiftScience from 'lib/siftscience';
import config from 'config';
import paths from './paths';

function registerMultiPage( { paths, handlers } ) {
	paths.forEach( path => page( path, ...handlers ) );
}

function getCommonHandlers(
	{ noSitePath = paths.domainManagementRoot(), warnIfJetpack = true } = {}
) {
	const handlers = [ controller.siteSelection, controller.navigation ];

	if ( noSitePath ) {
		handlers.push( domainsController.redirectIfNoSite( noSitePath ) );
	}

	if ( warnIfJetpack ) {
		handlers.push( controller.jetPackWarning );
	}

	return handlers;
}

export default function() {
	SiftScience.recordUser();

	page( paths.domainManagementEmail(), controller.siteSelection, controller.sites );

	registerMultiPage( {
		paths: [
			paths.domainManagementEmail( ':site', ':domain' ),
			paths.domainManagementEmail( ':site' ),
		],
		handlers: [
			...getCommonHandlers( { noSitePath: paths.domainManagementEmail() } ),
			domainManagementController.domainManagementEmail,
		],
	} );

	registerMultiPage( {
		paths: [
			paths.domainManagementAddGoogleApps( ':site', ':domain' ),
			paths.domainManagementAddGoogleApps( ':site' ),
		],
		handlers: [ ...getCommonHandlers(), domainManagementController.domainManagementAddGoogleApps ],
	} );

	page(
		paths.domainManagementEmailForwarding( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementEmailForwarding
	);

	page(
		paths.domainManagementRedirectSettings( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementRedirectSettings
	);

	page(
		paths.domainManagementContactsPrivacy( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementContactsPrivacy
	);

	page(
		paths.domainManagementEditContactInfo( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementEditContactInfo
	);

	page(
		paths.domainManagementDns( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementDns
	);

	page(
		paths.domainManagementNameServers( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementNameServers
	);

	page(
		paths.domainManagementTransfer( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementTransfer
	);

	page(
		paths.domainManagementTransferOut( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementTransferOut
	);

	page(
		paths.domainManagementTransferToAnotherUser( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementTransferToOtherUser
	);

	page(
		paths.domainManagementTransferToOtherSite( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementTransferToOtherSite
	);

	page( paths.domainManagementRoot(), controller.siteSelection, controller.sites );

	page(
		paths.domainManagementList( ':site' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementList
	);

	page(
		paths.domainManagementEdit( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementEdit
	);

	page(
		paths.domainManagementPrivacyProtection( ':site', ':domain' ),
		...getCommonHandlers( { warnIfJetpack: false } ),
		domainManagementController.domainManagementPrivacyProtection
	);

	page(
		paths.domainManagementPrimaryDomain( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementPrimaryDomain
	);

	if ( config.isEnabled( 'upgrades/domain-search' ) ) {
		page(
			'/domains/add',
			controller.siteSelection,
			domainsController.domainsAddHeader,
			domainsController.redirectToAddMappingIfVipSite(),
			controller.jetPackWarning,
			controller.sites
		);

		page(
			'/domains/add/mapping',
			controller.siteSelection,
			domainsController.domainsAddHeader,
			controller.jetPackWarning,
			controller.sites
		);

		page(
			'/domains/add/site-redirect',
			controller.siteSelection,
			domainsController.domainsAddRedirectHeader,
			controller.jetPackWarning,
			controller.sites
		);

		page(
			'/domains/add/:domain',
			controller.siteSelection,
			controller.navigation,
			domainsController.redirectIfNoSite( '/domains/add' ),
			domainsController.redirectToAddMappingIfVipSite(),
			controller.jetPackWarning,
			domainsController.domainSearch
		);

		page(
			'/domains/add/suggestion/:suggestion/:domain',
			controller.siteSelection,
			controller.navigation,
			domainsController.redirectIfNoSite( '/domains/add' ),
			domainsController.redirectToAddMappingIfVipSite(),
			controller.jetPackWarning,
			domainsController.domainSearch
		);

		page(
			'/domains/add/:registerDomain/google-apps/:domain',
			controller.siteSelection,
			controller.navigation,
			domainsController.redirectIfNoSite( '/domains/add' ),
			controller.jetPackWarning,
			domainsController.googleAppsWithRegistration
		);

		page(
			'/domains/add/mapping/:domain',
			controller.siteSelection,
			controller.navigation,
			domainsController.redirectIfNoSite( '/domains/add/mapping' ),
			controller.jetPackWarning,
			domainsController.mapDomain
		);

		page(
			'/domains/add/site-redirect/:domain',
			controller.siteSelection,
			controller.navigation,
			domainsController.redirectIfNoSite( '/domains/add/site-redirect' ),
			controller.jetPackWarning,
			domainsController.siteRedirect
		);
	}

	page( '/domains', controller.siteSelection, controller.sites );

	page(
		'/domains/:site',
		controller.siteSelection,
		controller.navigation,
		controller.jetPackWarning,
		domainManagementController.domainManagementIndex
	);
}
