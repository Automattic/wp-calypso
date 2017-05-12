/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSite } from 'state/sites/selectors';

/**
 * Get all sites
 *
 * @param {Object} state  Global state tree
 * @return {Array}        Sites objects
 */
export default createSelector(
	( state ) => (
		Object.values( state.sites.items )
			.map( site => getSite( state, site.ID ) )
	),
	( state ) => state.sites.items
);
