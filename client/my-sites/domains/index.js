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
import * as paths from './paths';
import { makeLayout, render as clientRender } from 'controller';

function registerMultiPage( { paths: givenPaths, handlers } ) {
	givenPaths.forEach( path => page( path, ...handlers ) );
}

function getCommonHandlers( {
	noSitePath = paths.domainManagementRoot(),
	warnIfJetpack = true,
} = {} ) {
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

	page( paths.domainManagementEmail(), siteSelection, sites, makeLayout, clientRender );

	registerMultiPage( {
		paths: [
			paths.domainManagementEmail( ':site', ':domain' ),
			paths.domainManagementEmail( ':site' ),
		],
		handlers: [
			...getCommonHandlers( { noSitePath: paths.domainManagementEmail() } ),
			domainManagementController.domainManagementEmail,
			makeLayout,
			clientRender,
		],
	} );

	registerMultiPage( {
		paths: [
			paths.domainManagementAddGoogleApps( ':site', ':domain' ),
			paths.domainManagementAddGoogleApps( ':site' ),
		],
		handlers: [
			...getCommonHandlers(),
			domainManagementController.domainManagementAddGoogleApps,
			makeLayout,
			clientRender,
		],
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
		paths.domainManagementTransferToOtherSite( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementTransferToOtherSite,
		makeLayout,
		clientRender
	);

	page( paths.domainManagementRoot(), siteSelection, sites, makeLayout, clientRender );

	page(
		paths.domainManagementList( ':site' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementList,
		makeLayout,
		clientRender
	);

	registerMultiPage( {
		paths: [
			paths.domainManagementEdit( ':site', ':domain' ),
			paths.domainManagementTransferIn( ':site', ':domain' ),
		],
		handlers: [
			...getCommonHandlers(),
			domainManagementController.domainManagementEdit,
			makeLayout,
			clientRender,
		],
	} );

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
			siteSelection,
			domainsController.domainsAddHeader,
			domainsController.redirectToAddMappingIfVipSite(),
			jetPackWarning,
			sites,
			makeLayout,
			clientRender
		);

		page(
			'/domains/add/mapping',
			siteSelection,
			domainsController.domainsAddHeader,
			jetPackWarning,
			sites,
			makeLayout,
			clientRender
		);

		page(
			'/domains/add/transfer',
			siteSelection,
			domainsController.domainsAddHeader,
			jetPackWarning,
			sites,
			makeLayout,
			clientRender
		);

		page(
			'/domains/add/site-redirect',
			siteSelection,
			domainsController.domainsAddRedirectHeader,
			jetPackWarning,
			sites,
			makeLayout,
			clientRender
		);

		page(
			'/domains/add/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add' ),
			domainsController.redirectToAddMappingIfVipSite(),
			jetPackWarning,
			domainsController.domainSearch,
			makeLayout,
			clientRender
		);

		page(
			'/domains/add/suggestion/:suggestion/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add' ),
			domainsController.redirectToAddMappingIfVipSite(),
			jetPackWarning,
			domainsController.redirectToDomainSearchSuggestion
		);

		page(
			'/domains/add/:registerDomain/google-apps/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add' ),
			jetPackWarning,
			domainsController.googleAppsWithRegistration,
			makeLayout,
			clientRender
		);

		page(
			'/domains/add/mapping/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add/mapping' ),
			jetPackWarning,
			domainsController.mapDomain,
			makeLayout,
			clientRender
		);

		page(
			'/domains/add/site-redirect/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add/site-redirect' ),
			jetPackWarning,
			domainsController.siteRedirect,
			makeLayout,
			clientRender
		);

		page(
			paths.domainTransferIn( ':domain' ),
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add/transfer' ),
			jetPackWarning,
			domainsController.transferDomain,
			makeLayout,
			clientRender
		);

		page(
			paths.domainManagementTransferInPrecheck( ':site', ':domain' ),
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/manage' ),
			jetPackWarning,
			domainsController.transferDomainPrecheck,
			makeLayout,
			clientRender
		);
	}

	page( '/domains', siteSelection, sites, makeLayout, clientRender );

	page(
		'/domains/:site',
		siteSelection,
		navigation,
		jetPackWarning,
		domainManagementController.domainManagementIndex,
		makeLayout,
		clientRender
	);
}
