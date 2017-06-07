/**
 * External dependencies
 */
import { partition, sortBy } from 'lodash/fp';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSite } from 'state/sites/selectors';
import { getPrimarySiteId } from 'state/selectors';

const sortByNameAndUrl = sortBy( [ 'name', 'URL' ] );

/**
 * Get all sites
 *
 * @param {Object} state  Global state tree
 * @return {Array}        Sites objects
 */
export default createSelector(
	( state ) => {
		const primarySiteId = getPrimarySiteId( state );
		const [ primarySite, sites ] = partition( { ID: primarySiteId } )( state.sites.items );

		return [
			...primarySite,
			...sortByNameAndUrl( sites )
		].map( site => getSite( state, site.ID ) );
	},
	( state ) => state.sites.items
);
