import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { recordSiftScienceUser } from 'calypso/lib/siftscience';
import {
	navigation,
	siteSelection,
	sites,
	wpForTeamsGeneralNotSupportedRedirect,
} from 'calypso/my-sites/controller';
import domainsController from './controller';
import domainManagementController from './domain-management/controller';
import * as paths from './paths';

function registerMultiPage( { paths: givenPaths, handlers } ) {
	givenPaths.forEach( ( path ) => page( path, ...handlers ) );
}

function registerStandardDomainManagementPages( pathFunction, controller ) {
	registerMultiPage( {
		paths: [
			pathFunction( ':site', ':domain' ),
			pathFunction( ':site', ':domain', paths.domainManagementRoot() ),
		],
		handlers: [ ...getCommonHandlers(), controller, makeLayout, clientRender ],
	} );
}

function getCommonHandlers( {
	noSitePath = paths.domainManagementRoot(),
	warnIfJetpack = true,
} = {} ) {
	const handlers = [ siteSelection, navigation, wpForTeamsGeneralNotSupportedRedirect ];

	if ( noSitePath ) {
		handlers.push( domainsController.redirectIfNoSite( noSitePath ) );
	}

	if ( warnIfJetpack ) {
		handlers.push( domainsController.jetpackNoDomainsWarning );
	}

	return handlers;
}

export default function () {
	page( '/domains*', recordSiftScienceUser );

	// These redirects are work-around in response to an issue where navigating back after a
	// successful site address change shows a continuous placeholder state... #23929 for details.
	page.redirect( '/domains/manage/edit', paths.domainManagementRoot() );
	page.redirect( '/domains/manage/edit/:site', paths.domainManagementRoot() );
	// This redirect should remain until we implement the `/domains/manage/all/edit-contact-info` route
	page.redirect(
		paths.domainManagementAllEditContactInfo(),
		paths.domainManagementRoot() + '?site=all&action=edit-contact-email'
	);

	registerMultiPage( {
		paths: [
			paths.domainManagementEmail(),
			paths.domainManagementEmail( ':site', ':domain' ),
			paths.domainManagementEmail( ':site' ),
		],
		handlers: [ domainManagementController.domainManagementEmailRedirect ],
	} );

	registerStandardDomainManagementPages(
		paths.domainManagementSecurity,
		domainManagementController.domainManagementSecurity
	);

	registerStandardDomainManagementPages(
		paths.domainManagementRedirectSettings,
		domainManagementController.domainManagementRedirectSettings
	);

	registerStandardDomainManagementPages(
		paths.domainManagementContactsPrivacy,
		domainManagementController.domainManagementContactsPrivacy
	);

	registerStandardDomainManagementPages(
		paths.domainManagementEditContactInfo,
		domainManagementController.domainManagementEditContactInfo
	);

	registerStandardDomainManagementPages(
		paths.domainManagementManageConsent,
		domainManagementController.domainManagementManageConsent
	);

	registerStandardDomainManagementPages(
		paths.domainManagementDomainConnectMapping,
		domainManagementController.domainManagementDomainConnectMapping
	);

	registerStandardDomainManagementPages(
		paths.domainManagementDns,
		domainManagementController.domainManagementDns
	);

	registerStandardDomainManagementPages(
		paths.domainManagementDnsAddRecord,
		domainManagementController.domainManagementDnsAddRecord
	);

	registerStandardDomainManagementPages(
		paths.domainManagementDnsEditRecord,
		domainManagementController.domainManagementDnsEditRecord
	);

	registerStandardDomainManagementPages(
		paths.domainManagementTransfer,
		domainManagementController.domainManagementTransfer
	);

	registerStandardDomainManagementPages(
		paths.domainManagementTransferOut,
		domainManagementController.domainManagementTransferOut
	);

	registerStandardDomainManagementPages(
		paths.domainManagementTransferToAnotherUser,
		domainManagementController.domainManagementTransferToOtherUser
	);

	registerStandardDomainManagementPages(
		paths.domainManagementTransferToOtherSite,
		domainManagementController.domainManagementTransferToOtherSite
	);

	page(
		paths.domainManagementRoot(),
		...getCommonHandlers( { noSitePath: false } ),
		domainManagementController.domainManagementListAllSites,
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

	registerStandardDomainManagementPages(
		paths.domainManagementEdit,
		domainManagementController.domainManagementEdit
	);

	registerStandardDomainManagementPages(
		paths.domainManagementSiteRedirect,
		domainManagementController.domainManagementSiteRedirect
	);

	registerStandardDomainManagementPages(
		paths.domainManagementTransferIn,
		domainManagementController.domainManagementTransferIn
	);

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
		'/domains/add/:domain/email/:siteSlug',
		siteSelection,
		navigation,
		domainsController.redirectIfNoSite( '/domains/add' ),
		domainsController.jetpackNoDomainsWarning,
		domainsController.emailUpsellForDomainRegistration,
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
		paths.domainMappingSetup( ':site', ':domain' ),
		siteSelection,
		navigation,
		domainsController.jetpackNoDomainsWarning,
		domainsController.mapDomainSetup,
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
		paths.domainUseMyDomain( ':site' ),
		siteSelection,
		navigation,
		domainsController.redirectIfNoSite( '/domains/add' ),
		domainsController.jetpackNoDomainsWarning,
		domainsController.useMyDomain,
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

	page(
		paths.domainManagementRoot() + '/:domain/edit',
		domainsController.redirectDomainToSite,
		makeLayout,
		clientRender
	);

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
