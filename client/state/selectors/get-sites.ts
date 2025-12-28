import { createSelector } from '@automattic/state-utils';
import { partition, sortBy } from 'lodash';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { getSite } from 'calypso/state/sites/selectors';
import type { SiteDetails } from '@automattic/data-stores';
import type { AppState } from 'calypso/types';

const sortByNameAndUrl = ( list: SiteDetails[] ): SiteDetails[] =>
	sortBy( list, [ 'name', 'URL' ] );

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
		const [ primarySite, sites ] = partition( sitesArray, { ID: primarySiteId } );

		const allSites = shouldSort ? sortByNameAndUrl( sites ) : sites;

		return [ ...primarySite, ...allSites ].map( ( site ) => getSite( state, site.ID ) );
	},
	( state: AppState ) => [ getSitesItems( state ), state.currentUser.capabilities ]
);
