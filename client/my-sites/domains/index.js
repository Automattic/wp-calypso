import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { recordSiftScienceUser } from 'calypso/lib/siftscience';
import {
	navigation,
	siteSelection,
	sites,
	wpForTeamsGeneralNotSupportedRedirect,
	stagingSiteNotSupportedRedirect,
	noSite,
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
	noSiteSelection = false,
	warnIfJetpack = true,
} = {} ) {
	const handlers = [
		...( noSiteSelection ? [] : [ siteSelection ] ),
		navigation,
		wpForTeamsGeneralNotSupportedRedirect,
		stagingSiteNotSupportedRedirect,
	];

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
		handlers: [
			stagingSiteNotSupportedRedirect,
			domainManagementController.domainManagementEmailRedirect,
		],
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
		paths.domainManagementTransferToAnyUser,
		domainManagementController.domainManagementTransferToAnyUser
	);

	registerStandardDomainManagementPages(
		paths.domainManagementTransferToOtherSite,
		domainManagementController.domainManagementTransferToOtherSite
	);

	page(
		paths.domainManagementRoot(),
		noSite,
		...getCommonHandlers( { noSitePath: false, noSiteSelection: true } ),
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
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
		siteSelection,
		domainsController.domainsAddHeader,
		domainsController.jetpackNoDomainsWarning,
		sites,
		makeLayout,
		clientRender
	);

	page(
		'/domains/add/transfer',
		stagingSiteNotSupportedRedirect,
		siteSelection,
		domainsController.domainsAddHeader,
		domainsController.jetpackNoDomainsWarning,
		sites,
		makeLayout,
		clientRender
	);

	page(
		'/domains/add/site-redirect',
		stagingSiteNotSupportedRedirect,
		siteSelection,
		domainsController.domainsAddRedirectHeader,
		domainsController.jetpackNoDomainsWarning,
		sites,
		makeLayout,
		clientRender
	);

	page(
		'/domains/add/:domain',
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
		siteSelection,
		navigation,
		domainsController.redirectIfNoSite( '/domains/add' ),
		domainsController.redirectToUseYourDomainIfVipSite(),
		domainsController.jetpackNoDomainsWarning,
		domainsController.redirectToDomainSearchSuggestion
	);

	page(
		'/domains/add/mapping/:domain',
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
		siteSelection,
		navigation,
		domainsController.jetpackNoDomainsWarning,
		domainsController.mapDomainSetup,
		makeLayout,
		clientRender
	);

	page(
		'/domains/add/site-redirect/:domain',
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
		domainsController.redirectDomainToSite,
		makeLayout,
		clientRender
	);

	page(
		'/domains/:site',
		stagingSiteNotSupportedRedirect,
		siteSelection,
		navigation,
		domainsController.jetpackNoDomainsWarning,
		domainManagementController.domainManagementIndex,
		makeLayout,
		clientRender
	);
}
