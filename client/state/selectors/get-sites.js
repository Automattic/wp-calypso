/**
 * External dependencies
 */
import { concat, partition, map } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSite } from 'state/sites/selectors';
import { getPrimarySiteId } from 'state/selectors';

/**
 * Get all sites
 *
 * @param {Object} state  Global state tree
 * @return {Array}        Sites objects
 */
export default createSelector(
	( state ) => {
		const primarySiteId = getPrimarySiteId( state );
		const [ primarySite, sites ] = partition( state.sites.items, { ID: primarySiteId } );
		return map( concat( primarySite, sites ), site => getSite( state, site.ID ) );
	},
	( state ) => state.sites.items
);
