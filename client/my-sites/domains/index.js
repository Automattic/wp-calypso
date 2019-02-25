/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
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
		handlers.push( domainsController.jetpackNoDomainsWarning );
	}

	return handlers;
}

export default function() {
	SiftScience.recordUser();

	// These redirects are work-around in response to an issue where navigating back after a
	// successful site address change shows a continuous placeholder state... #23929 for details.
	page.redirect( '/domains/manage/edit', paths.domainManagementRoot() );
	page.redirect( '/domains/manage/edit/:site', paths.domainManagementRoot() );

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
			paths.domainManagementAddGSuiteUsers( ':site', ':domain' ),
			paths.domainManagementAddGSuiteUsers( ':site' ),
		],
		handlers: [
			...getCommonHandlers(),
			domainManagementController.domainManagementAddGSuiteUsers,
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
		paths.domainManagementManageConsent( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementManageConsent,
		makeLayout,
		clientRender
	);

	page(
		paths.domainManagementDomainConnectMapping( ':site', ':domain' ),
		...getCommonHandlers(),
		domainManagementController.domainManagementDomainConnectMapping,
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
			domainsController.redirectToUseYourDomainIfVipSite(),
			domainsController.jetpackNoDomainsWarning,
			sites,
			makeLayout,
			clientRender
		);

		page(
			'/domains/add/mapping',
			siteSelection,
			domainsController.domainsAddHeader,
			domainsController.jetpackNoDomainsWarning,
			sites,
			makeLayout,
			clientRender
		);

		page(
			'/domains/add/transfer',
			siteSelection,
			domainsController.domainsAddHeader,
			domainsController.jetpackNoDomainsWarning,
			sites,
			makeLayout,
			clientRender
		);

		page(
			'/domains/add/site-redirect',
			siteSelection,
			domainsController.domainsAddRedirectHeader,
			domainsController.jetpackNoDomainsWarning,
			sites,
			makeLayout,
			clientRender
		);

		page(
			'/domains/add/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add' ),
			domainsController.redirectToUseYourDomainIfVipSite(),
			domainsController.jetpackNoDomainsWarning,
			domainsController.domainSearch,
			makeLayout,
			clientRender
		);

		page(
			'/domains/add/suggestion/:suggestion/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add' ),
			domainsController.redirectToUseYourDomainIfVipSite(),
			domainsController.jetpackNoDomainsWarning,
			domainsController.redirectToDomainSearchSuggestion
		);

		page(
			'/domains/add/:registerDomain/google-apps/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add' ),
			domainsController.jetpackNoDomainsWarning,
			domainsController.googleAppsWithRegistration,
			makeLayout,
			clientRender
		);

		page(
			'/domains/add/mapping/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add/mapping' ),
			domainsController.jetpackNoDomainsWarning,
			domainsController.mapDomain,
			makeLayout,
			clientRender
		);

		page(
			'/domains/add/site-redirect/:domain',
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add/site-redirect' ),
			domainsController.jetpackNoDomainsWarning,
			domainsController.siteRedirect,
			makeLayout,
			clientRender
		);

		page(
			paths.domainTransferIn( ':domain' ),
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add/transfer' ),
			domainsController.jetpackNoDomainsWarning,
			domainsController.transferDomain,
			makeLayout,
			clientRender
		);

		page(
			paths.domainUseYourDomain( ':site' ),
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/add' ),
			domainsController.jetpackNoDomainsWarning,
			domainsController.useYourDomain,
			makeLayout,
			clientRender
		);

		page(
			paths.domainManagementTransferInPrecheck( ':site', ':domain' ),
			siteSelection,
			navigation,
			domainsController.redirectIfNoSite( '/domains/manage' ),
			domainsController.jetpackNoDomainsWarning,
			domainsController.transferDomainPrecheck,
			makeLayout,
			clientRender
		);
	}

	page(
		'/domains/:site',
		siteSelection,
		navigation,
		domainsController.jetpackNoDomainsWarning,
		domainManagementController.domainManagementIndex,
		makeLayout,
		clientRender
	);
}
