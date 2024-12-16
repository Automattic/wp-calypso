import page from '@automattic/calypso-router';
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
import emailController from '../email/controller';
import domainsController from './controller';
import domainManagementController from './domain-management/controller';
import {
	DOMAIN_OVERVIEW,
	EMAIL_MANAGEMENT,
} from './domain-management/domain-overview-pane/constants';
import * as paths from './paths';

/**
 * Registers a multi-page route.
 *
 * @param {Object} options - The options object.
 * @param {Array} options.paths - The paths to register.
 * @param {Array} options.handlers - The handlers to register. These will be applied to each path.
 */
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

	page(
		paths.domainManagementAllEditSelectedContactInfo(),
		noSite,
		...getCommonHandlers( { noSitePath: false, noSiteSelection: true } ),
		domainManagementController.domainManagementAllEditSelectedContactInfo,
		makeLayout,
		clientRender
	);
	page(
		paths.domainManagementEditSelectedContactInfo( ':site' ),
		noSite,
		...getCommonHandlers( { noSitePath: false, noSiteSelection: true } ),
		domainManagementController.domainManagementEditSelectedContactInfo,
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
		stagingSiteNotSupportedRedirect,
		sites,
		makeLayout,
		clientRender
	);

	page(
		'/domains/add/mapping',
		siteSelection,
		domainsController.domainsAddHeader,
		domainsController.jetpackNoDomainsWarning,
		stagingSiteNotSupportedRedirect,
		sites,
		makeLayout,
		clientRender
	);

	page(
		'/domains/add/transfer',
		siteSelection,
		domainsController.domainsAddHeader,
		domainsController.jetpackNoDomainsWarning,
		stagingSiteNotSupportedRedirect,
		sites,
		makeLayout,
		clientRender
	);

	page(
		'/domains/add/site-redirect',
		siteSelection,
		domainsController.domainsAddRedirectHeader,
		domainsController.jetpackNoDomainsWarning,
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
		domainsController.redirectToDomainSearchSuggestion
	);

	page(
		'/domains/add/mapping/:domain',
		siteSelection,
		navigation,
		domainsController.redirectIfNoSite( '/domains/add/mapping' ),
		domainsController.jetpackNoDomainsWarning,
		stagingSiteNotSupportedRedirect,
		domainsController.mapDomain,
		makeLayout,
		clientRender
	);

	page(
		paths.domainMappingSetup( ':site', ':domain' ),
		siteSelection,
		navigation,
		domainsController.jetpackNoDomainsWarning,
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
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
		stagingSiteNotSupportedRedirect,
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
		siteSelection,
		navigation,
		domainsController.jetpackNoDomainsWarning,
		stagingSiteNotSupportedRedirect,
		domainManagementController.domainManagementIndex,
		makeLayout,
		clientRender
	);

	page(
		paths.domainManagementOverviewRoot() + '/:domain/:site',
		siteSelection,
		navigation,
		domainManagementController.domainManagementV2,
		domainManagementController.domainManagementPaneView( DOMAIN_OVERVIEW ),
		domainManagementController.domainDashboardLayout,
		makeLayout,
		clientRender
	);

	page(
		paths.domainManagementEmailRoot() + '/:domain/:site',
		siteSelection,
		navigation,
		emailController.emailManagement,
		domainManagementController.domainManagementPaneView( EMAIL_MANAGEMENT ),
		domainManagementController.domainDashboardLayout,
		makeLayout,
		clientRender
	);
}
