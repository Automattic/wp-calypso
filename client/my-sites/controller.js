import config from '@automattic/calypso-config';
import { PLAN_FREE, PLAN_JETPACK_FREE } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { removeQueryArgs } from '@wordpress/url';
import i18n from 'i18n-calypso';
import { some, startsWith } from 'lodash';
import { createElement } from 'react';
import EmptyContentComponent from 'calypso/components/empty-content';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import {
	makeLayout,
	render as clientRender,
	setSectionMiddleware,
	redirectLoggedOut,
} from 'calypso/controller';
import { composeHandlers } from 'calypso/controller/shared';
import { render } from 'calypso/controller/web-util';
import { cloudSiteSelection } from 'calypso/jetpack-cloud/controller';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { navigate } from 'calypso/lib/navigate';
import { onboardingUrl } from 'calypso/lib/paths';
import { addQueryArgs, getSiteFragment, sectionify, trailingslashit } from 'calypso/lib/route';
import { withoutHttp } from 'calypso/lib/url';
import {
	domainManagementDns,
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainManagementList,
	domainManagementRedirectSettings,
	domainManagementTransfer,
	domainManagementTransferOut,
	domainManagementTransferToOtherSite,
	domainManagementRoot,
	domainManagementDnsAddRecord,
	domainManagementDnsEditRecord,
	domainAddNew,
	domainUseMyDomain,
} from 'calypso/my-sites/domains/paths';
import {
	getEmailManagementPath,
	getAddEmailForwardsPath,
	getAddGSuiteUsersPath,
	getForwardingPath,
	getMailboxesPath,
	getEmailInDepthComparisonPath,
	getManageTitanAccountPath,
	getManageTitanMailboxesPath,
	getNewTitanAccountPath,
	getPurchaseNewEmailAccountPath,
	getTitanControlPanelRedirectPath,
	getTitanSetUpMailboxPath,
} from 'calypso/my-sites/email/paths';
import DIFMLiteInProgress from 'calypso/my-sites/marketing/do-it-for-me/difm-lite-in-progress';
import NavigationComponent from 'calypso/my-sites/navigation';
import SitesComponent from 'calypso/my-sites/sites';
import {
	getCurrentUser,
	isUserLoggedIn,
	getCurrentUserSiteCount,
} from 'calypso/state/current-user/selectors';
import { successNotice, warningNotice, errorNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { hasReceivedRemotePreferences, getPreference } from 'calypso/state/preferences/selectors';
import getP2HubBlogId from 'calypso/state/selectors/get-p2-hub-blog-id';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import isDIFMLiteInProgress from 'calypso/state/selectors/is-difm-lite-in-progress';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isSiteMigrationInProgress from 'calypso/state/selectors/is-site-migration-in-progress';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import wasEcommerceTrialSite from 'calypso/state/selectors/was-ecommerce-trial-site';
import wasUpgradedFromTrialSite from 'calypso/state/selectors/was-upgraded-from-trial-site';
import { requestSite } from 'calypso/state/sites/actions';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import {
	getSite,
	getSiteId,
	getSiteOption,
	getSitePlanSlug,
	getSiteSlug,
} from 'calypso/state/sites/selectors';
import { isSupportSession } from 'calypso/state/support/selectors';
import { setSelectedSiteId, setAllSitesSelected } from 'calypso/state/ui/actions';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

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

	let allSitesPath = basePath === '/home' ? '/sites' : basePath;

	// Update allSitesPath if it is plugins page in Jetpack Cloud
	if ( isJetpackCloud() && basePath.startsWith( '/plugins' ) ) {
		allSitesPath = '/plugins';
	}

	return (
		<NavigationComponent
			path={ context.path }
			allSitesPath={ allSitesPath }
			siteBasePath={ basePath }
		/>
	);
}

export function renderRebloggingEmptySites( context ) {
	setSectionMiddleware( { group: 'sites' } )( context );
	recordTracksEvent( 'calypso_post_share_no_sites' );

	const actionURL = addQueryArgs(
		{
			blog_post: context.query?.url,
		},
		'/setup/reblogging'
	);

	context.primary = createElement( () =>
		NoSitesMessage( {
			title: i18n.translate( 'Create a site to reblog' ),
			line: i18n.translate(
				"Create your first website to reblog content from other sites you're following."
			),
			actionURL,
			actionCallback: () => {
				recordTracksEvent( 'calypso_post_share_no_sites_create_site_click' );
			},
		} )
	);

	makeLayout( context, noop );
	clientRender( context );
}

export function renderEmptySites( context ) {
	setSectionMiddleware( { group: 'sites' } )( context );

	context.primary = createElement( NoSitesMessage );

	makeLayout( context, noop );
	clientRender( context );
}

export function renderNoVisibleSites( context ) {
	const { getState } = getStore( context );
	const state = getState();
	const currentUser = getCurrentUser( state );
	const hiddenSites = currentUser && currentUser.site_count - currentUser.visible_site_count;

	setSectionMiddleware( { group: 'sites' } )( context );

	context.primary = createElement( EmptyContentComponent, {
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
		secondaryActionURL: `${ onboardingUrl() }?ref=calypso-nosites`,
		className: 'no-visible-sites-message',
	} );

	makeLayout( context, noop );
	clientRender( context );
}

function renderSelectedSiteIsDIFMLiteInProgress( reactContext, selectedSite ) {
	reactContext.primary = <DIFMLiteInProgress siteId={ selectedSite.ID } />;

	reactContext.secondary = createNavigation( reactContext );

	makeLayout( reactContext, noop );
	clientRender( reactContext );
}

function isPathAllowedForDomainOnlySite( path, slug, primaryDomain, contextParams ) {
	const allPaths = [
		domainManagementDns,
		domainManagementDnsAddRecord,
		domainManagementDnsEditRecord,
		domainManagementEdit,
		domainManagementEditContactInfo,
		domainManagementList,
		domainManagementRedirectSettings,
		domainManagementTransfer,
		domainManagementTransferOut,
		domainManagementTransferToOtherSite,
		getEmailManagementPath,
		getAddEmailForwardsPath,
		getAddGSuiteUsersPath,
		getForwardingPath,
		getMailboxesPath,
		getEmailInDepthComparisonPath,
		getManageTitanAccountPath,
		getManageTitanMailboxesPath,
		getNewTitanAccountPath,
		getPurchaseNewEmailAccountPath,
		getTitanControlPanelRedirectPath,
		getTitanSetUpMailboxPath,
	];

	// Builds a list of paths using a site slug plus any additional parameter that may be required
	let domainManagementPaths = allPaths.map( ( pathFactory ) => {
		if ( pathFactory === getAddGSuiteUsersPath ) {
			return getAddGSuiteUsersPath( slug, slug, contextParams.productType );
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

	// We now allow domain-only sites to have multiple domains, so we need to allow them to be managed
	// See https://wp.me/pdhack-Hk for more context on the motivation for this decision
	if ( contextParams.domain ) {
		domainManagementPaths = domainManagementPaths.concat(
			allPaths.map( ( pathFactory ) => pathFactory( slug, contextParams.domain ) )
		);
	}

	const startsWithPaths = [
		'/themes',
		'/plugins',
		'/checkout/',
		`/me/purchases/${ slug }`,
		`/purchases/add-payment-method/${ slug }`,
		`/purchases/billing-history/${ slug }`,
		`/purchases/payment-methods/${ slug }`,
		`/purchases/subscriptions/${ slug }`,
		// Any page under `/domains/manage/all` should be accessible in domain-only sites now that we allow multiple domains in them
		'/domains/manage/all/',
		'/email/all/',
		'/people/',
		'/settings/start-site-transfer/',
		// Add A Domain > Search for a domain
		domainAddNew( slug ),
		// Add A Domain > Use a domain I own
		// Start Transfer button
		domainUseMyDomain( slug ),
	];

	if ( some( startsWithPaths, ( startsWithPath ) => startsWith( path, startsWithPath ) ) ) {
		return true;
	}

	return domainManagementPaths.indexOf( path ) > -1;
}

/**
 * The paths allowed for domain-only sites and DIFM in-progress sites are the same
 * with one exception - /domains/add should be allowed for DIFM in-progress sites.
 * @param {string} path The path to be checked
 * @param {string} slug The site slug
 * @param {Array} domains The list of site domains
 * @param {Object} contextParams Context parameters
 * @returns {boolean} true if the path is allowed, false otherwise
 */
function isPathAllowedForDIFMInProgressSite( path, slug, domains, contextParams ) {
	const DIFMLiteInProgressAllowedPaths = [ domainAddNew(), getEmailManagementPath( slug ) ];

	const isAllowedForDomainOnlySites = domains.some( ( domain ) =>
		isPathAllowedForDomainOnlySite( path, slug, domain, contextParams )
	);

	return (
		isAllowedForDomainOnlySites ||
		DIFMLiteInProgressAllowedPaths.some( ( DIFMLiteInProgressAllowedPath ) =>
			path.startsWith( DIFMLiteInProgressAllowedPath )
		)
	);
}

function onSelectedSiteAvailable( context ) {
	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );
	// Use getSitePlanSlug() as it ignores expired plans.
	const currentPlanSlug = getSitePlanSlug( state, selectedSite.ID );

	// If we had a trial plan, and the user doesn't have a paid plan (active or expired),
	// redirect to full-page trial expired page.
	if (
		wasEcommerceTrialSite( state, selectedSite.ID ) &&
		! wasUpgradedFromTrialSite( state, selectedSite.ID ) &&
		[ PLAN_FREE, PLAN_JETPACK_FREE ].includes( currentPlanSlug )
	) {
		const permittedPathPrefixes = [
			'/checkout/',
			'/domains/',
			'/email/',
			'/export/',
			'/plans/my-plan/trial-expired/',
			'/purchases/',
			'/settings/delete-site/',
		];

		if ( ! permittedPathPrefixes.some( ( prefix ) => context.pathname.startsWith( prefix ) ) ) {
			page.redirect( `/plans/my-plan/trial-expired/${ selectedSite.slug }` );
			return false;
		}
		context.hideLeftNavigation = true;
	} else {
		// If migration is in progress, only /migrate paths should be loaded for the site
		const isMigrationInProgress = isSiteMigrationInProgress( state, selectedSite.ID );
		if ( isMigrationInProgress && ! startsWith( context.pathname, '/migrate/' ) ) {
			page.redirect( `/migrate/${ selectedSite.slug }` );
			return false;
		}
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
		page.redirect( domainManagementRoot() );
		return false;
	}

	/**
	 * For DIFM in-progress sites, render the in-progress screen for all
	 * paths except those in the allow-list defined in `isPathAllowedForDIFMInProgressSite`.
	 * Ignore this check if we are inside a support session.
	 */
	const domains = getDomainsBySiteId( state, selectedSite.ID );
	if (
		isDIFMLiteInProgress( state, selectedSite.ID ) &&
		! isSupportSession( state ) &&
		! isPathAllowedForDIFMInProgressSite(
			context.pathname,
			selectedSite.slug,
			domains,
			context.params
		)
	) {
		renderSelectedSiteIsDIFMLiteInProgress( context, selectedSite );
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
 * @param {Object} context -- Middleware context
 * @returns {Object} A site-picker React element
 */
function createSitesComponent( context ) {
	const contextPath = sectionify( context.path );

	let filteredPathName = contextPath.split( '/no-site' )[ 0 ];

	if ( context.querystring ) {
		filteredPathName = `${ filteredPathName }?${ context.querystring }`;
	}

	// This path sets the URL to be visited once a site is selected
	let basePath = filteredPathName === '/sites' ? '/home' : filteredPathName;

	// Update basePath if it is plugins page in Jetpack Cloud
	if ( isJetpackCloud() && basePath.startsWith( '/plugins' ) ) {
		basePath = '/plugins/manage';
	}

	recordPageView( contextPath, sitesPageTitleForAnalytics );

	return (
		<SitesComponent
			siteBasePath={ basePath }
			getSiteSelectionHeaderText={ context.getSiteSelectionHeaderText }
			fromSite={ context.query.site }
			clearPageTitle={ context.clearPageTitle }
			isPostShare={ context.query?.is_post_share }
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
		dispatch(
			errorNotice(
				isJetpackCloud()
					? i18n.translate( 'Your Primary site is not a Jetpack site.' )
					: i18n.translate( 'Please set a Primary site.' ),
				{
					button: i18n.translate( 'Account Settings' ),
					href: `https://wordpress.com/me/account`,
				}
			)
		);

		recordTracksEvent( 'calypso_mysites_single_site_error', tracksPayload );
	}
}

// Clears selected site from global redux state
export function noSite( context, next ) {
	const { getState } = getStore( context );
	const currentUser = getCurrentUser( getState() );
	const hasSite = currentUser && currentUser.visible_site_count >= 1;
	const siteFragment = context.params.site || getSiteFragment( context.path );
	const isDomainOnlyFlow = context.query?.isDomainOnly === '1' || ! siteFragment;
	const isJetpackCheckoutFlow = context.pathname.includes( '/checkout/jetpack' );
	const isAkismetCheckoutFlow = context.pathname.includes( '/checkout/akismet' );
	const isMarketplaceSitelessCheckoutFlow = context.pathname.includes( '/checkout/marketplace' );
	const isDomainsManage = context.pathname === '/domains/manage/';
	const isGiftCheckoutFlow = context.pathname.includes( '/gift/' );
	const isRenewal = context.pathname.includes( '/renew/' );

	if (
		! isDomainOnlyFlow &&
		! isJetpackCheckoutFlow &&
		! isAkismetCheckoutFlow &&
		! isMarketplaceSitelessCheckoutFlow &&
		! isGiftCheckoutFlow &&
		! isDomainsManage &&
		// We allow renewals without a site through because we want to show these
		// users an error message on the checkout page.
		! isRenewal &&
		hasSite
	) {
		siteSelection( context, next );
		return;
	}

	context.store.dispatch( setSelectedSiteId( null ) );
	return next();
}

const PATHS_EXCLUDED_FROM_SINGLE_SITE_CONTEXT_FOR_SINGLE_SITE_USERS = [
	'/plugins',
	'/plugins/manage',
	'/themes',
];

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
	const currentUser = getCurrentUser( getState() );
	const hasOneSite = currentUser && currentUser.visible_site_count === 1;
	const isPathExcludedFromSingleSiteContext =
		PATHS_EXCLUDED_FROM_SINGLE_SITE_CONTEXT_FOR_SINGLE_SITE_USERS.includes( context.path );

	// Making sure non-connected users get redirected to user connection flow.
	// Details: p9dueE-6Hf-p2
	const isUnlinkedCheckout =
		'1' === context.query?.unlinked && context.pathname.match( /^\/checkout\/[^/]+\/jetpack_/i );

	const shouldRenderNoSites = ! context.section.enableNoSites && ! isUnlinkedCheckout;

	// The user doesn't have any sites: render `NoSitesMessage`
	if ( currentUser && currentUser.site_count === 0 && shouldRenderNoSites ) {
		if ( context.query?.is_post_share ) {
			renderRebloggingEmptySites( context );
		} else {
			renderEmptySites( context );
		}
		recordNoSitesPageView( context, siteFragment );
		return;
	}

	// The user has all sites set as hidden: render help message with how to make them visible
	if ( currentUser && currentUser.visible_site_count === 0 && shouldRenderNoSites ) {
		renderNoVisibleSites( context );
		recordNoVisibleSitesPageView( context, siteFragment );
		return;
	}

	/*
	 * If the user has only one site, redirect to the single site context instead of
	 * rendering the all-site views. Exclude plugins page from this behavior.
	 *
	 * If the primary site is not yet available in Redux state, initiate a fetch and postpone the
	 * redirect until the fetch is complete. (while the primary site ID is a property of the
	 * current user object and therefore always available, we need to fetch the site info in order
	 * to convert the site ID to the site slug that will be part of the redirect URL)
	 */
	if ( hasOneSite && ! siteFragment && ! isPathExcludedFromSingleSiteContext ) {
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
	const typeOfSiteFragment = typeof siteFragment;
	if (
		! ( typeOfSiteFragment === 'string' && siteFragment.length ) &&
		typeOfSiteFragment !== 'number'
	) {
		dispatch( setAllSitesSelected() );
		return next();
	}

	const siteId = getSiteId( getState(), siteFragment );

	if ( siteId && ! isUnlinkedCheckout ) {
		// onSelectedSiteAvailable might render an error page about domain-only sites or redirect
		// to wp-admin. In that case, don't continue handling the route.
		dispatch( setSelectedSiteId( siteId ) );

		const currentPlanSlug = getSitePlanSlug( getState(), siteId );
		const shouldUpdateStateAfterUpgrade =
			context.pathname.startsWith( '/plans/my-plan/trial-upgraded/' ) &&
			[ PLAN_FREE, PLAN_JETPACK_FREE ].includes( currentPlanSlug );

		// This will fetch the site and update the state after the plan is upgraded if the site is on the trial-upgraded flow.
		const promise = shouldUpdateStateAfterUpgrade
			? dispatch( requestSite( siteId ) ).catch( () => {
					return null;
			  } )
			: Promise.resolve();
		promise.then( () => {
			if ( onSelectedSiteAvailable( context ) ) {
				next();
			}
		} );
	} else {
		// Fetch the site by siteFragment and then try to select again
		dispatch( requestSite( siteFragment ) )
			.catch( () => null )
			.then( ( site ) => {
				// If we found a site using the fragment and the fragment matches the *.wordpress.com domain for a site with a mapped domain,
				// redirect to the mapped domain, e.g /site-editor/example.wordpress.com -> /site-editor/example.com
				if ( site && site.ID ) {
					const siteSlug = getSiteSlug( getState(), site.ID );
					const unmappedSlug = withoutHttp( getSiteOption( getState(), site.ID, 'unmapped_url' ) );

					if ( unmappedSlug !== siteSlug && unmappedSlug === siteFragment ) {
						const hash = context.hashstring ? `#${ context.hashstring }` : '';
						return page.redirect( context.path.replace( siteFragment, siteSlug ) + hash );
					}
				}

				let freshSiteId = getSiteId( getState(), siteFragment );

				if ( ! freshSiteId ) {
					const wpcomStagingFragment = siteFragment
						.toString()
						.replace( /\b.wordpress.com/, '.wpcomstaging.com' );
					freshSiteId = getSiteId( getState(), wpcomStagingFragment );
				}

				// If the user is presumably not connected to WPCOM, we ignore the site ID we found.
				// Details: p9dueE-6Hf-p2
				if ( freshSiteId && ! isUnlinkedCheckout ) {
					// onSelectedSiteAvailable might render an error page about domain-only sites or redirect
					// to wp-admin. In that case, don't continue handling the route.
					dispatch( setSelectedSiteId( freshSiteId ) );
					if ( onSelectedSiteAvailable( context ) ) {
						next();
					}
				} else if ( shouldRedirectToJetpackAuthorize( context, site ) ) {
					navigate( getJetpackAuthorizeURL( context, site ) );
				} else {
					// If the site has loaded but siteId is still invalid then redirect to allSitesPath.
					const siteFragmentOffset = context.path.indexOf( `/${ siteFragment }` );
					const allSitesPath = context.path.substring( 0, siteFragmentOffset );
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
	if ( ! context.hideLeftNavigation ) {
		context.secondary = createNavigation( context );
	}
	next();
}

/**
 * Middleware that adds the site selector screen to the layout.
 * @param {Object} context -- Middleware context
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
 * Use this middleware to prevent navigation to pages which are not supported by staging sites.
 * @param {Object} context -- Middleware context
 * @param {Function} next -- Call next middleware in chain
 */
export function stagingSiteNotSupportedRedirect( context, next ) {
	const store = context.store;
	const selectedSite = getSelectedSite( store.getState() );

	if ( selectedSite && isSiteWpcomStaging( store.getState(), selectedSite.ID ) ) {
		const siteSlug = getSiteSlug( store.getState(), selectedSite.ID );

		return page.redirect( `/home/${ siteSlug }` );
	}

	next();
}

/**
 * Use this middleware to prevent navigation to pages which are not supported by the P2 project but only
 * if the P2+ paid plan is disabled for the specific environment (ie development vs production).
 *
 * If you need to prevent navigation to pages for the P2 project in general,
 * see `wpForTeamsP2PlusNotSupportedRedirect`.
 * @param {Object} context -- Middleware context
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
 * @param {Object} context -- Middleware context
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
 * Use this middleware to prevent navigation to pages which are not supported by the P2 project in general.
 *
 * If you need to prevent navigation to pages based on whether the P2+ paid plan is enabled or disabled,
 * see `wpForTeamsP2PlusNotSupportedRedirect`.
 * @param {Object} context -- Middleware context
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
 * @param {Object} context -- The context object.
 * @param {Object} site -- The site information.
 * @returns {boolean} shouldRedirect -- Whether we need to redirect user to the Jetpack site for authorization.
 */
export function shouldRedirectToJetpackAuthorize( context, site ) {
	return '1' === context.query?.unlinked && !! site?.URL;
}

/**
 * Get redirect URL to the Jetpack site for authorization.
 * @param {Object} context -- The context object.
 * @param {Object} site -- The site information.
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

export function selectSite( context ) {
	// Logged in: Terminate the regular handler path by not calling next()
	// and render the site selection screen, redirecting the user if they
	// only have one site.
	composeHandlers( siteSelection, selectSiteIfNotDeleted, sites, makeLayout, render )( context );
}

export function selectSiteIfNotDeleted( context, next ) {
	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	if ( selectedSite && selectedSite.is_deleted ) {
		context.store.dispatch( setSelectedSiteId( null ) );
		return;
	}

	return next();
}

export function selectSiteIfLoggedIn( context, next ) {
	const state = context.store.getState();
	if ( ! isUserLoggedIn( state ) ) {
		next();
		return;
	}

	selectSite( context );
}

/**
 * If the section has an "all sites" view to delay the site selection,
 * only handle the site selection with 0 or 1 sites.
 */
export function selectSiteOrSkipIfLoggedInWithMultipleSites( context, next ) {
	const state = context.store.getState();
	const isLoggedIn = isUserLoggedIn( state );
	const siteCount = getCurrentUserSiteCount( state );
	const siteFragment =
		context.params.site || context.params.site_id || getSiteFragment( context.path );

	// If the user is logged out, has 0 sites, or the path contains a site fragment,
	// proceed with the regular site selection.
	if ( ! isLoggedIn || ! siteCount || !! siteFragment ) {
		siteSelection( context, next );
		return;
	}

	// If the user only has 1 site and the path doesn't contain a site fragment,
	// select the site automatically and move on.
	if ( siteCount === 1 ) {
		selectSite( context );
		return;
	}

	// If the user has multiple sites and the path doesn't contain a site fragment,
	// proceed with rendering the page, delaying the site selection.
	next();
}

export function hideNavigationIfLoggedInWithNoSites( context, next ) {
	const state = context.store.getState();
	if ( isUserLoggedIn( state ) && getCurrentUserSiteCount( state ) === 0 ) {
		context.hideLeftNavigation = true;
	}
	next();
}

export function addNavigationIfLoggedIn( context, next ) {
	const state = context.store.getState();
	if ( isUserLoggedIn( state ) ) {
		navigation( context, next );
	}
	next();
}

export function redirectToLoginIfSiteRequested( context, next ) {
	if ( context.params.site_id ) {
		redirectLoggedOut( context, next );
		return;
	}

	next();
}
