import { createSelector } from '@automattic/state-utils';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { getSite } from 'calypso/state/sites/selectors';
import type { SiteDetails } from '@automattic/data-stores';
import type { AppState } from 'calypso/types';

const sortByNameAndUrl = ( list: SiteDetails[] ): SiteDetails[] => {
	return list.slice().sort( ( a, b ) => {
		// Ensure name is always a string to prevent localeCompare errors with malformed API data.
		// If name is null/undefined/non-string, fall back to URL, then empty string.
		const aName = String( a.name ?? a.URL ?? '' );
		const bName = String( b.name ?? b.URL ?? '' );
		const nameCompare = aName.localeCompare( bName );
		if ( nameCompare !== 0 ) {
			return nameCompare;
		}
		// If names are equal, sort by URL as a tiebreaker
		return String( a.URL ?? '' ).localeCompare( String( b.URL ?? '' ) );
	} );
};

/**
 * Get all sites
 * @param state  Global state tree
 * @param shouldSort Whether to sort the sites by name and URL
 * @returns Sites objects
 */
export default createSelector(
	( state: AppState, shouldSort = true ): ( SiteDetails | null | undefined )[] => {
		const primarySiteId = getPrimarySiteId( state );
		const sitesItems = getSitesItems( state );
		const sitesArray = Object.values( sitesItems );

		// Partition sites into primary and non-primary
		const primarySite = sitesArray.filter( ( site ) => site.ID === primarySiteId );
		const sites = sitesArray.filter( ( site ) => site.ID !== primarySiteId );

		const allSites = shouldSort ? sortByNameAndUrl( sites ) : sites;

		return [ ...primarySite, ...allSites ].map( ( site ) => getSite( state, site.ID ) );
	},
	( state: AppState ) => [ getSitesItems( state ), state.currentUser.capabilities ]
);
