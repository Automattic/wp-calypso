/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { jetPackWarning, navigation, siteSelection, sites } from 'my-sites/controller';
import domainsController from './controller';
import domainManagementController from './domain-management/controller';
import SiftScience from 'lib/siftscience';
import config from 'config';
import paths from './paths';

function registerMultiPage( { paths: givenPaths, handlers } ) {
	givenPaths.forEach( path => page( path, ...handlers ) );
}

function getCommonHandlers(
	{ noSitePath = paths.domainManagementRoot(), warnIfJetpack = true } = {}
) {
	const handlers = [ siteSelection, navigation ];

	if ( noSitePath ) {
		handlers.push( domainsController.redirectIfNoSite( noSitePath ) );
	}

	if ( warnIfJetpack ) {
		handlers.push( jetPackWarning );
	}

	return handlers;
}

export default function() {
	SiftScience.recordUser();

	page( paths.domainManagementEmail(), siteSelection, sites );

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

	page( paths.domainManagementRoot(), siteSelection, sites );

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
			siteSelection,
			domainsController.domainsAddHeader,
			domainsController.redirectToAddMappingIfVipSite(),
			jetPackWarning,
			sites
		);

		page(
			'/domains/add/mapping',
			siteSelection,
			domainsController.domainsAddHeader,
			jetPackWarning,
			sites
		);

		page(
			'/domains/add/transfer',
			siteSelection,
			domainsController.domainsAddHeader,
			jetPackWarning,
			sites
		);

		page(
			'/domains/add/site-redirect',
			siteSelection,
			domainsController.domainsAddRedirectHeader,
			jetPackWarning,
			sites
		);

		page(
			'/domains/add/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add' ),
			domainsController.redirectToAddMappingIfVipSite(),
			jetPackWarning,
			domainsController.domainSearch
		);

		page(
			'/domains/add/suggestion/:suggestion/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add' ),
			domainsController.redirectToAddMappingIfVipSite(),
			jetPackWarning,
			domainsController.domainSearch
		);

		page(
			'/domains/add/:registerDomain/google-apps/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add' ),
			jetPackWarning,
			domainsController.googleAppsWithRegistration
		);

		page(
			'/domains/add/mapping/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add/mapping' ),
			jetPackWarning,
			domainsController.mapDomain
		);

		page(
			'/domains/add/site-redirect/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add/site-redirect' ),
			jetPackWarning,
			domainsController.siteRedirect
		);

		page(
			'/domains/add/transfer/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add/transfer' ),
			jetPackWarning,
			domainsController.transferDomain
		);
	}

	page( '/domains', siteSelection, sites );

	page(
		'/domains/:site',
		siteSelection,
		navigation,
		jetPackWarning,
		domainManagementController.domainManagementIndex
	);
}
