/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { addQueryArgs, getSiteFragment, sectionify } from 'calypso/lib/route';
import { redirectToPrimary, updateRecentSitesPreferences } from 'calypso/my-sites/controller';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getSiteId from 'calypso/state/selectors/get-site-id';
import { requestSite } from 'calypso/state/sites/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { setSelectedSiteId, setAllSitesSelected } from 'calypso/state/ui/actions';

/**
 * Type dependencies
 */
import type { UserData } from 'calypso/lib/user/user';

const parseSiteFragment = ( context: PageJS.Context ): string | undefined => {
	const siteFragment = context.params.site || getSiteFragment( context.path );

	if ( siteFragment ) {
		return siteFragment;
	}

	const { query: queryParams, pathname } = context;
	const { site: siteQuery } = queryParams;

	if ( siteQuery ) {
		page.redirect(
			addQueryArgs(
				{
					...queryParams,
					site: undefined,
				},
				`${ pathname }/${ siteQuery }`
			)
		);
	}
};

const fetchSite = (
	context: PageJS.Context,
	siteId: number | string
): Promise< { id: number | undefined; slug: string | undefined } > => {
	const { getState, dispatch } = context.store;

	return dispatch( requestSite( siteId ) ).then( () => ( {
		id: getSiteId( getState(), siteId ),
		slug: getSiteSlug( getState(), siteId ),
	} ) );
};

const selectSite = ( context: PageJS.Context, siteId: number ): void => {
	const { dispatch } = context.store;

	dispatch( setSelectedSiteId( siteId ) );
	updateRecentSitesPreferences( context );
};

const siteSelectionWithoutFragment = ( context: PageJS.Context, next: () => void ): void => {
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
					// TODO: display error
				}
			} );
		}
	} else {
		// Show all sites
		dispatch( setAllSitesSelected() );
		next();
	}
};

const siteSelectionWithFragment = (
	siteFragment: string,
	context: PageJS.Context,
	next: () => void
): void => {
	const { getState } = context.store;
	const siteId = getSiteId( getState(), siteFragment );

	// Site is already available in state
	if ( siteId ) {
		selectSite( context, siteId );
		next();
	} else {
		fetchSite( context, siteFragment ).then( ( { id } ) => {
			if ( id ) {
				selectSite( context, id );
				next();
			} else {
				const allSitesPath = addQueryArgs(
					{ site: siteFragment },
					sectionify( context.path, siteFragment )
				);

				page.redirect( allSitesPath );
			}
		} );
	}
};

export function cloudSiteSelection( context: PageJS.Context, next: () => void ): void {
	const siteFragment = parseSiteFragment( context );

	// TODO: handle no Jetpack site
	// TODO: handle no visible Jetpack site

	if ( siteFragment ) {
		siteSelectionWithFragment( siteFragment, context, next );
	} else {
		siteSelectionWithoutFragment( context, next );
	}
}
