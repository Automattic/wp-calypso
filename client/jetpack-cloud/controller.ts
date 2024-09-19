import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getLanguageSlugs } from '@automattic/i18n-utils';
import { createElement } from 'react';
import { NoJetpackSitesMessage } from 'calypso/components/jetpack/no-jetpack-sites-message';
import { makeLayout, render as clientRender, setSectionMiddleware } from 'calypso/controller';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import { addQueryArgs, getSiteFragment, sectionify } from 'calypso/lib/route';
import {
	redirectToPrimary,
	updateRecentSitesPreferences,
	renderNoVisibleSites,
	showMissingPrimaryError,
} from 'calypso/my-sites/controller';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { requestSite } from 'calypso/state/sites/actions';
import { getSiteId, getSiteSlug } from 'calypso/state/sites/selectors';
import { setSelectedSiteId, setAllSitesSelected } from 'calypso/state/ui/actions';
import type { Context as PageJSContext } from '@automattic/calypso-router';
import type { UserData } from 'calypso/lib/user/user';

/**
 * Parse site slug from path.
 */
const parseSiteFragment = ( context: PageJSContext ): string | undefined => {
	return context.params.site || getSiteFragment( context.path ) || undefined;
};

/**
 * Fetch site data.
 */
const fetchSite = (
	context: PageJSContext,
	siteIdOrSlug: number | string
): Promise< { id: number | undefined; slug: string | undefined } > => {
	const { getState, dispatch } = context.store;

	return dispatch( requestSite( siteIdOrSlug ) )
		.catch( () => null )
		.then( () => ( {
			id: getSiteId( getState(), siteIdOrSlug ),
			slug: getSiteSlug( getState(), siteIdOrSlug ),
		} ) );
};

/**
 * Store site id in state, and add site to the list of most recent sites.
 */
const selectSite = ( context: PageJSContext, siteId: number ): void => {
	const { dispatch } = context.store;

	dispatch( setSelectedSiteId( siteId ) );
	updateRecentSitesPreferences( context );
};

/**
 * Handle case when path contains no site slug. If the current user has only
 * one site, we try to use this site for context. Otherwise, the user must
 * select one of their sites.
 */
const siteSelectionWithoutFragment = ( context: PageJSContext, next: () => void ): void => {
	const { getState, dispatch } = context.store;
	const currentUser = getCurrentUser( getState() ) as UserData;
	const hasOneSite = currentUser?.visible_site_count === 1;

	// User has only one site
	if ( hasOneSite ) {
		const primarySiteId = getPrimarySiteId( getState() ) as NonNullable< number >;
		const primarySiteSlug = getSiteSlug( getState(), primarySiteId );

		// Site is already available in state
		if ( primarySiteSlug ) {
			// Redirect to the single site context
			redirectToPrimary( context, primarySiteSlug );
		} else {
			fetchSite( context, primarySiteId ).then( ( { slug } ) => {
				if ( slug ) {
					// Redirect to the single site context
					redirectToPrimary( context, slug );
				} else {
					// Display error notification
					showMissingPrimaryError( currentUser, dispatch );
				}
			} );
		}
	} else {
		// Show all sites
		dispatch( setAllSitesSelected() );
		next();
	}
};

/**
 * Select site when path contains a site slug.
 * @param {string} siteFragment Parsed site slug
 * @param {PageJSContext} context Route context
 * @param {Function} next Next middleware function
 */
const siteSelectionWithFragment = async (
	siteFragment: string,
	context: PageJSContext,
	next: () => void
): Promise< void > => {
	const { getState } = context.store;
	const siteId = getSiteId( getState(), siteFragment );

	// Site is already available in state
	if ( siteId ) {
		selectSite( context, siteId );
		next();
	} else {
		const { id } = await fetchSite( context, siteFragment );

		if ( id ) {
			selectSite( context, id );
			next();
		} else if ( '1' === context.query.unlinked ) {
			// The user is not linked to that Jetpack site, we'll do that later on when needed.
			next();
		} else {
			const allSitesPath = addQueryArgs(
				{ site: siteFragment },
				sectionify( context.path, siteFragment )
			);

			page.redirect( allSitesPath );
		}
	}
};

/**
 * Render a screen to indicate that there are no Jetpack sites.
 */
const renderNoJetpackSites = ( context: PageJSContext, siteSlug?: string ) => {
	setSectionMiddleware( { group: 'sites' } )( context );

	context.primary = createElement( NoJetpackSitesMessage, { siteSlug } );

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	makeLayout( context, () => {} );
	clientRender( context );
};

/**
 * Record a page view for no Jetpack sites.
 */
function recordNoJetpackSitesPageView( context: PageJSContext, siteFragment: string | undefined ) {
	recordPageView( '/landing', 'No Jetpack Sites', {
		base_path: sectionify( context.path, siteFragment ),
	} );
}

/**
 * Record a page view for no visible Jetpack sites.
 */
function recordNoVisibleJetpackSitesPageView(
	context: PageJSContext,
	siteFragment: string | undefined
) {
	recordPageView( '/landing', 'All Jetpack Sites Hidden', {
		base_path: sectionify( context.path, siteFragment ),
	} );
}

/**
 * Show dedicated screen if user has no Jetpack site, or no visible Jetpack site
 * @param {string|undefined} siteFragment Parsed site slug
 * @param {PageJSContext} context Route context
 * @returns {boolean} True if user has neither Jetpack sites nor visible Jetpack sites
 */
export function noSite( siteFragment: string | undefined, context: PageJSContext ): boolean {
	const { getState } = context.store;
	const currentUser = getCurrentUser( getState() ) as UserData;

	const hasNoJetpackSites = isEnabled( 'jetpack/manage-simple-sites' )
		? 0 === currentUser?.site_count
		: 0 === currentUser?.jetpack_site_count && 0 === currentUser?.atomic_site_count;

	if ( hasNoJetpackSites ) {
		renderNoJetpackSites( context, currentUser.primarySiteSlug );
		recordNoJetpackSitesPageView( context, siteFragment );
		return true;
	}

	const hasNoVisibleSites = isEnabled( 'jetpack/manage-simple-sites' )
		? 0 === currentUser?.visible_site_count
		: 0 === currentUser?.jetpack_visible_site_count && 0 === currentUser?.atomic_visible_site_count;

	if ( hasNoVisibleSites ) {
		renderNoVisibleSites( context );
		recordNoVisibleJetpackSitesPageView( context, siteFragment );
		return true;
	}

	return false;
}

/**
 * Parse site slug from path and call the proper middleware.
 * @param {PageJSContext} context Route context
 * @param {Function} next Next middleware function
 */
export async function cloudSiteSelection(
	context: PageJSContext,
	next: () => void
): Promise< void > {
	const siteFragment = parseSiteFragment( context );

	if ( noSite( siteFragment, context ) ) {
		return;
	}

	if ( siteFragment ) {
		const languages = getLanguageSlugs().join( '|' );
		// Regex defines url starts with /:locale/pricing or /pricing
		const pricingMatchingPath = new RegExp( `^(/(?:${ languages }))?/pricing` );

		if ( pricingMatchingPath.test( context.path ) ) {
			const { id } = await fetchSite( context, siteFragment );
			if ( ! id ) {
				await siteSelectionWithoutFragment( context, next );
				return;
			}
		}
		await siteSelectionWithFragment( siteFragment, context, next );
	} else {
		await siteSelectionWithoutFragment( context, next );
	}
}
