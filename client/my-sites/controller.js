/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import i18n from 'i18n-calypso';
import { get, some, startsWith } from 'lodash';
import { removeQueryArgs } from '@wordpress/url';

/**
 * Internal Dependencies
 */
import { cloudSiteSelection } from 'calypso/jetpack-cloud/controller';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { requestSite } from 'calypso/state/sites/actions';
import { getSite, getSiteId, getSiteAdminUrl, getSiteSlug } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { setSelectedSiteId, setAllSitesSelected } from 'calypso/state/ui/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { hasReceivedRemotePreferences, getPreference } from 'calypso/state/preferences/selectors';
import NavigationComponent from 'calypso/my-sites/navigation';
import {
	addQueryArgs,
	getSiteFragment,
	sectionify,
	externalRedirect,
	trailingslashit,
} from 'calypso/lib/route';
import config from '@automattic/calypso-config';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { getCurrentUser, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteMigrationInProgress from 'calypso/state/selectors/is-site-migration-in-progress';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import getOnboardingUrl from 'calypso/state/selectors/get-onboarding-url';
import {
	domainManagementContactsPrivacy,
	domainManagementDns,
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainManagementList,
	domainManagementNameServers,
	domainManagementRedirectSettings,
	domainManagementTransfer,
	domainManagementTransferOut,
	domainManagementTransferToOtherSite,
	domainManagementRoot,
} from 'calypso/my-sites/domains/paths';
import {
	emailManagement,
	emailManagementAddGSuiteUsers,
	emailManagementForwarding,
	emailManagementManageTitanAccount,
	emailManagementManageTitanMailboxes,
	emailManagementNewTitanAccount,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
import SitesComponent from 'calypso/my-sites/sites';
import { successNotice, warningNotice } from 'calypso/state/notices/actions';
import { makeLayout, render as clientRender, setSectionMiddleware } from 'calypso/controller';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import EmptyContentComponent from 'calypso/components/empty-content';
import DomainOnly from 'calypso/my-sites/domains/domain-management/list/domain-only';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import getP2HubBlogId from 'calypso/state/selectors/get-p2-hub-blog-id';

/*
 * @FIXME Shorthand, but I might get rid of this.
 */
const getStore = ( context ) => ( {
	getState: () => context.store.getState(),
	dispatch: ( action ) => context.store.dispatch( action ),
} );

/**
 * Module vars
 */
const sitesPageTitleForAnalytics = 'Sites';
const noop = () => {};

/*
 * The main navigation of My Sites consists of a component with
 * the site selector list and the sidebar section items
 * @param { object } context - Middleware context
 * @returns { object } React element containing the site selector and sidebar
 */
export function createNavigation( context ) {
	const siteFragment = getSiteFragment( context.pathname );
	let basePath = context.pathname;

	if ( siteFragment ) {
		basePath = sectionify( context.pathname );
	}

	return (
		<NavigationComponent
			path={ context.path }
			allSitesPath={ basePath }
			siteBasePath={ basePath }
		/>
	);
}

export function renderEmptySites( context ) {
	setSectionMiddleware( { group: 'sites' } )( context );

	context.primary = React.createElement( NoSitesMessage );

	makeLayout( context, noop );
	clientRender( context );
}

export function renderNoVisibleSites( context ) {
	const { getState } = getStore( context );
	const state = getState();
	const currentUser = getCurrentUser( state );
	const hiddenSites = currentUser && currentUser.site_count - currentUser.visible_site_count;
	const onboardingUrl = getOnboardingUrl( state );

	setSectionMiddleware( { group: 'sites' } )( context );

	context.primary = React.createElement( EmptyContentComponent, {
		title: i18n.translate(
			'You have %(hidden)d hidden WordPress site.',
			'You have %(hidden)d hidden WordPress sites.',
			{
				count: hiddenSites,
				args: { hidden: hiddenSites },
			}
		),

		line: i18n.translate(
			'To manage it here, set it to visible.',
			'To manage them here, set them to visible.',
			{
				count: hiddenSites,
			}
		),

		action: i18n.translate( 'Change Visibility' ),
		actionURL: '//dashboard.wordpress.com/wp-admin/index.php?page=my-blogs',
		secondaryAction: i18n.translate( 'Create New Site' ),
		secondaryActionURL: `${ onboardingUrl }?ref=calypso-nosites`,
		className: 'no-visible-sites-message',
	} );

	makeLayout( context, noop );
	clientRender( context );
}

function renderSelectedSiteIsDomainOnly( reactContext, selectedSite ) {
	reactContext.primary = <DomainOnly siteId={ selectedSite.ID } hasNotice={ false } />;

	reactContext.secondary = createNavigation( reactContext );

	makeLayout( reactContext, noop );
	clientRender( reactContext );
}

function isPathAllowedForDomainOnlySite( path, slug, primaryDomain, contextParams ) {
	const allPaths = [
		domainManagementContactsPrivacy,
		domainManagementDns,
		domainManagementEdit,
		domainManagementEditContactInfo,
		domainManagementList,
		domainManagementNameServers,
		domainManagementRedirectSettings,
		domainManagementTransfer,
		domainManagementTransferOut,
		domainManagementTransferToOtherSite,
		emailManagement,
		emailManagementAddGSuiteUsers,
		emailManagementForwarding,
		emailManagementManageTitanAccount,
		emailManagementManageTitanMailboxes,
		emailManagementNewTitanAccount,
		emailManagementTitanControlPanelRedirect,
	];

	// Builds a list of paths using a site slug plus any additional parameter that may be required
	let domainManagementPaths = allPaths.map( ( pathFactory ) => {
		if ( pathFactory === emailManagementAddGSuiteUsers ) {
			return emailManagementAddGSuiteUsers( slug, slug, contextParams.productType );
		}

		return pathFactory( slug, slug );
	} );

	// Builds a list of paths using a site slug, and which are relative to the root of the domain management section
	domainManagementPaths = domainManagementPaths.concat(
		allPaths.map( ( pathFactory ) => {
			return pathFactory( slug, slug, domainManagementRoot() );
		} )
	);

	// Builds a list of paths using a site slug but also a primary domain - if they differ
	if ( primaryDomain && slug !== primaryDomain.name ) {
		domainManagementPaths = domainManagementPaths.concat(
			allPaths.map( ( pathFactory ) => pathFactory( slug, primaryDomain.name ) )
		);
	}

	const startsWithPaths = [
		'/checkout/',
		`/me/purchases/${ slug }`,
		`/purchases/add-payment-method/${ slug }`,
		`/purchases/billing-history/${ slug }`,
		`/purchases/payment-methods/${ slug }`,
		`/purchases/subscriptions/${ slug }`,
	];

	if ( some( startsWithPaths, ( startsWithPath ) => startsWith( path, startsWithPath ) ) ) {
		return true;
	}

	return domainManagementPaths.indexOf( path ) > -1;
}

function onSelectedSiteAvailable( context, basePath ) {
	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	const isAtomicSite = isSiteAutomatedTransfer( state, selectedSite.ID );
	const userCanManagePlugins = canCurrentUser( state, selectedSite.ID, 'activate_plugins' );

	// If migration is in progress, only /migrate paths should be loaded for the site
	const isMigrationInProgress = isSiteMigrationInProgress( state, selectedSite.ID );

	if ( isMigrationInProgress && ! startsWith( context.pathname, '/migrate/' ) ) {
		page.redirect( `/migrate/${ selectedSite.slug }` );
		return false;
	}

	// Redirects Atomic sites to wp-admin
	if ( userCanManagePlugins && isAtomicSite && /^\/plugins/.test( basePath ) ) {
		const plugin = get( context, 'params.plugin' );
		let pluginString = '';
		if ( plugin ) {
			pluginString = [
				'tab=search',
				`s=${ plugin }`,
				'type=term',
				'modal-mode=true',
				`plugin=${ plugin }`,
			].join( '&' );
		}

		const pluginInstallURL = 'plugin-install.php?' + `${ pluginString }`;
		const pluginLink = getSiteAdminUrl( state, selectedSite.ID ) + pluginInstallURL;

		window.location.replace( pluginLink );
		return false;
	}

	const primaryDomain = getPrimaryDomainBySiteId( state, selectedSite.ID );
	if (
		isDomainOnlySite( state, selectedSite.ID ) &&
		! isPathAllowedForDomainOnlySite(
			context.pathname,
			selectedSite.slug,
			primaryDomain,
			context.params
		)
	) {
		renderSelectedSiteIsDomainOnly( context, selectedSite );
		return false;
	}

	updateRecentSitesPreferences( context );

	return true;
}

export function updateRecentSitesPreferences( context ) {
	const state = context.store.getState();

	if ( hasReceivedRemotePreferences( state ) ) {
		const siteId = getSelectedSiteId( state );
		const recentSites = getPreference( state, 'recentSites' );

		if ( siteId && siteId !== recentSites[ 0 ] ) {
			// Also filter recent sites if not available locally
			const updatedRecentSites = [ ...new Set( [ siteId, ...recentSites ] ) ]
				.slice( 0, 5 )
				.filter( ( recentId ) => !! getSite( state, recentId ) );

			context.store.dispatch( savePreference( 'recentSites', updatedRecentSites ) );
		}
	}
}

/**
 * Returns the site-picker react element.
 *
 * @param {object} context -- Middleware context
 * @returns {object} A site-picker React element
 */
function createSitesComponent( context ) {
	const contextPath = sectionify( context.path );

	let filteredPathName = contextPath.split( '/no-site' )[ 0 ];

	if ( context.querystring ) {
		filteredPathName = `${ filteredPathName }?${ context.querystring }`;
	}

	// This path sets the URL to be visited once a site is selected
	const basePath = filteredPathName === '/sites' ? '/home' : filteredPathName;

	recordPageView( contextPath, sitesPageTitleForAnalytics );

	return (
		<SitesComponent
			siteBasePath={ basePath }
			getSiteSelectionHeaderText={ context.getSiteSelectionHeaderText }
			fromSite={ context.query.site }
			clearPageTitle={ context.clearPageTitle }
		/>
	);
}

export function showMissingPrimaryError( currentUser, dispatch ) {
	const { username, primary_blog, primary_blog_url, primary_blog_is_jetpack } = currentUser;
	const tracksPayload = {
		username,
		primary_blog,
		primary_blog_url,
		primary_blog_is_jetpack,
	};

	if ( currentUser.primary_blog_is_jetpack ) {
		dispatch(
			warningNotice( i18n.translate( "Please check your Primary Site's Jetpack connection" ), {
				button: 'wp-admin',
				href: `${ currentUser.primary_blog_url }/wp-admin`,
			} )
		);
		recordTracksEvent( 'calypso_mysites_single_site_jetpack_connection_error', tracksPayload );
	} else {
		recordTracksEvent( 'calypso_mysites_single_site_error', tracksPayload );
	}
}

// Clears selected site from global redux state
export function noSite( context, next ) {
	const { getState } = getStore( context );
	const currentUser = getCurrentUser( getState() );
	const hasSite = currentUser && currentUser.visible_site_count >= 1;
	const isDomainOnlyFlow = context.query?.isDomainOnly === '1';

	if ( ! isDomainOnlyFlow && hasSite ) {
		siteSelection( context, next );
	} else {
		context.store.dispatch( setSelectedSiteId( null ) );
		return next();
	}
}

/*
 * Set up site selection based on last URL param and/or handle no-sites error cases
 */
export function siteSelection( context, next ) {
	if ( isJetpackCloud() ) {
		cloudSiteSelection( context, next );
		return;
	}

	const { getState, dispatch } = getStore( context );
	const siteFragment = context.params.site || getSiteFragment( context.path );
	const basePath = sectionify( context.path, siteFragment );
	const currentUser = getCurrentUser( getState() );
	const hasOneSite = currentUser && currentUser.visible_site_count === 1;

	// The user doesn't have any sites: render `NoSitesMessage`
	if ( currentUser && currentUser.site_count === 0 ) {
		renderEmptySites( context );
		recordNoSitesPageView( context, siteFragment );
		return;
	}

	// The user has all sites set as hidden: render help message with how to make them visible
	if ( currentUser && currentUser.visible_site_count === 0 ) {
		renderNoVisibleSites( context );
		recordNoVisibleSitesPageView( context, siteFragment );
		return;
	}

	/*
	 * If the user has only one site, redirect to the single site context instead of
	 * rendering the all-site views.
	 *
	 * If the primary site is not yet available in Redux state, initiate a fetch and postpone the
	 * redirect until the fetch is complete. (while the primary site ID is a property of the
	 * current user object and therefore always available, we need to fetch the site info in order
	 * to convert the site ID to the site slug that will be part of the redirect URL)
	 */
	if ( hasOneSite && ! siteFragment ) {
		const primarySiteId = getPrimarySiteId( getState() );
		const primarySiteSlug = getSiteSlug( getState(), primarySiteId );

		if ( primarySiteSlug ) {
			redirectToPrimary( context, primarySiteSlug );
		} else {
			// Fetch the primary site by ID and then try to determine its slug again.
			dispatch( requestSite( primarySiteId ) )
				.catch( () => null )
				.then( () => {
					const freshPrimarySiteSlug = getSiteSlug( getState(), primarySiteId );
					if ( freshPrimarySiteSlug ) {
						redirectToPrimary( context, freshPrimarySiteSlug );
					} else {
						// If the primary site does not exist, skip redirect
						// and display a useful error notification
						showMissingPrimaryError( currentUser, dispatch );
					}
				} );
		}

		return;
	}

	// If the path fragment does not resemble a site, set all sites to visible
	if ( ! siteFragment ) {
		dispatch( setAllSitesSelected() );
		return next();
	}

	const siteId = getSiteId( getState(), siteFragment );
	if ( siteId ) {
		// onSelectedSiteAvailable might render an error page about domain-only sites or redirect
		// to wp-admin. In that case, don't continue handling the route.
		dispatch( setSelectedSiteId( siteId ) );
		if ( onSelectedSiteAvailable( context, basePath ) ) {
			next();
		}
	} else {
		// Fetch the site by siteFragment and then try to select again
		dispatch( requestSite( siteFragment ) )
			.catch( () => null )
			.then( ( site ) => {
				let freshSiteId = getSiteId( getState(), siteFragment );

				if ( ! freshSiteId ) {
					const wpcomStagingFragment = siteFragment.replace(
						/\b.wordpress.com/,
						'.wpcomstaging.com'
					);
					freshSiteId = getSiteId( getState(), wpcomStagingFragment );
				}

				if ( freshSiteId ) {
					// onSelectedSiteAvailable might render an error page about domain-only sites or redirect
					// to wp-admin. In that case, don't continue handling the route.
					dispatch( setSelectedSiteId( freshSiteId ) );
					if ( onSelectedSiteAvailable( context, basePath ) ) {
						next();
					}
				} else if ( shouldRedirectToJetpackAuthorize( context, site ) ) {
					externalRedirect( getJetpackAuthorizeURL( context, site ) );
				} else {
					// If the site has loaded but siteId is still invalid then redirect to allSitesPath.
					const allSitesPath = addQueryArgs(
						{ site: siteFragment },
						sectionify( context.path, siteFragment )
					);
					page.redirect( allSitesPath );
				}
			} );
	}
}

export function loggedInSiteSelection( context, next ) {
	if ( isUserLoggedIn( context.store.getState() ) ) {
		siteSelection( context, next );
		return;
	}
	next();
}

export function recordNoSitesPageView( context, siteFragment, title ) {
	recordPageView( '/no-sites', sitesPageTitleForAnalytics + ` > ${ title || 'No Sites' }`, {
		base_path: sectionify( context.path, siteFragment ),
	} );
}

export function recordNoVisibleSitesPageView( context, siteFragment ) {
	recordNoSitesPageView( context, siteFragment, 'All Sites Hidden' );
}

export function redirectToPrimary( context, primarySiteSlug ) {
	const pathNameSplit = context.pathname.split( '/no-site' )[ 0 ];
	const pathname = pathNameSplit.replace( /\/?$/, '/' ); // append trailing slash if not present
	let redirectPath = `${ pathname }${ primarySiteSlug }`;
	if ( context.querystring ) {
		redirectPath += `?${ context.querystring }`;
	}
	page.redirect( redirectPath );
}

export function navigation( context, next ) {
	// Render the My Sites navigation in #secondary
	context.secondary = createNavigation( context );
	next();
}

/**
 * Middleware that adds the site selector screen to the layout.
 *
 * @param {object} context -- Middleware context
 * @param {Function} next -- Call next middleware in chain
 */
export function sites( context, next ) {
	if ( context.query.verified === '1' ) {
		context.store.dispatch(
			successNotice(
				i18n.translate(
					"Email verified! Now that you've confirmed your email address you can publish posts on your blog."
				)
			)
		);
	}

	context.store.dispatch( setLayoutFocus( 'content' ) );
	setSectionMiddleware( { group: 'sites' } )( context );

	context.primary = createSitesComponent( context );
	next();
}

export function redirectWithoutSite( redirectPath ) {
	return ( context, next ) => {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );
		if ( ! siteId ) {
			return page.redirect( redirectPath );
		}

		return next();
	};
}

/**
 * Use this middleware to prevent navigation to pages which are not supported by the P2 project but only
 * if the P2+ paid plan is disabled for the specific environment (ie development vs production).
 *
 * If you need to prevent navigation to pages for the P2 project in general,
 * see `wpForTeamsP2PlusNotSupportedRedirect`.
 *
 * @param {object} context -- Middleware context
 * @param {Function} next -- Call next middleware in chain
 */
export function wpForTeamsP2PlusNotSupportedRedirect( context, next ) {
	const store = context.store;
	const selectedSite = getSelectedSite( store.getState() );

	if (
		! config.isEnabled( 'p2/p2-plus' ) &&
		selectedSite &&
		isSiteWPForTeams( store.getState(), selectedSite.ID )
	) {
		const siteSlug = getSiteSlug( store.getState(), selectedSite.ID );

		return page.redirect( `/home/${ siteSlug }` );
	}

	next();
}

/**
 * For P2s, only hubs can have a plan. If we are on P2 a site that is a site under
 * a hub, we redirect the hub's plans page.
 *
 * @param {object} context -- Middleware context
 * @param {Function} next -- Call next middleware in chain
 */
export function p2RedirectToHubPlans( context, next ) {
	const store = context.store;
	const selectedSite = getSelectedSite( store.getState() );

	if (
		config.isEnabled( 'p2/p2-plus' ) &&
		selectedSite &&
		isSiteWPForTeams( store.getState(), selectedSite.ID ) &&
		! isSiteP2Hub( store.getState(), selectedSite.ID )
	) {
		const hubId = getP2HubBlogId( store.getState(), selectedSite.ID );
		const hubSlug = getSiteSlug( store.getState(), hubId );
		if ( hubSlug ) {
			return page.redirect( `/plans/my-plan/${ hubSlug }` );
		}
	}

	next();
}

/**
 * For P2s, we sometimes want to redirect to the hub of a P2 site. If we are on
 * a P2 site under a hub this will redirect to the same path on the hub.
 *
 * @param {object} context -- Middleware context
 * @param {Function} next -- Call next middleware in chain
 */
export function p2RedirectToHub( context, next ) {
	const store = context.store;
	const selectedSite = getSelectedSite( store.getState() );

	if (
		selectedSite &&
		isSiteWPForTeams( store.getState(), selectedSite.ID ) &&
		! isSiteP2Hub( store.getState(), selectedSite.ID )
	) {
		const hubId = getP2HubBlogId( store.getState(), selectedSite.ID );
		const hubSlug = getSiteSlug( store.getState(), hubId );
		if ( hubSlug ) {
			const selectedSiteSlug = getSelectedSiteSlug( store.getState() );
			return page.redirect( context.path.replace( selectedSiteSlug, hubSlug ) );
		}
	}

	next();
}

/**
 * Use this middleware to prevent navigation to pages which are not supported by the P2 project in general.
 *
 * If you need to prevent navigation to pages based on whether the P2+ paid plan is enabled or disabled,
 * see `wpForTeamsP2PlusNotSupportedRedirect`.
 *
 * @param {object} context -- Middleware context
 * @param {Function} next -- Call next middleware in chain
 */
export function wpForTeamsGeneralNotSupportedRedirect( context, next ) {
	const store = context.store;
	const selectedSite = getSelectedSite( store.getState() );

	if ( selectedSite && isSiteWPForTeams( store.getState(), selectedSite.ID ) ) {
		const siteSlug = getSiteSlug( store.getState(), selectedSite.ID );

		return page.redirect( `/home/${ siteSlug }` );
	}

	next();
}

/**
 * Whether we need to redirect user to the Jetpack site for authorization.
 *
 * @param {object} context -- The context object.
 * @param {object} site -- The site information.
 * @returns {boolean} shouldRedirect -- Whether we need to redirect user to the Jetpack site for authorization.
 */
export function shouldRedirectToJetpackAuthorize( context, site ) {
	return '1' === context.query?.unlinked && !! site?.URL;
}

/**
 * Get redirect URL to the Jetpack site for authorization.
 *
 * @param {object} context -- The context object.
 * @param {object} site -- The site information.
 * @returns {string} redirectURL -- The redirect URL.
 */
export function getJetpackAuthorizeURL( context, site ) {
	return addQueryArgs(
		{
			page: 'jetpack',
			action: 'authorize_redirect',
			dest_url: removeQueryArgs( window.origin + context.path, 'unlinked' ),
		},
		trailingslashit( site?.URL ) + 'wp-admin/'
	);
}
