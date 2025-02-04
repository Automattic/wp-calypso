import { createSelector } from '@automattic/state-utils';
import { partition, sortBy } from 'lodash';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { getSite } from 'calypso/state/sites/selectors';

const sortByNameAndUrl = ( list ) => sortBy( list, [ 'name', 'URL' ] );

/**
 * Get only sites that are not deleted. Deleted sites cause some issues in some parts of the UI but are still needed in others.
 * @param {Object} state  Global state tree
 * @returns {Array}        Sites objects
 */
export default createSelector(
	( state, shouldSort = true ) => {
		const primarySiteId = getPrimarySiteId( state );
		const [ primarySite, sites ] = partition( getSitesItems( state ), { ID: primarySiteId } );

		const allSites = shouldSort ? sortByNameAndUrl( sites ) : sites;

		return [ ...primarySite, ...allSites ]
			.map( ( site ) => getSite( state, site.ID ) )
			.filter( ( site ) => ! site.is_deleted );
	},
	( state ) => [ getSitesItems( state ), state.currentUser.capabilities ]
);
