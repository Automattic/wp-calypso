/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';
import createSelector from 'lib/create-selector';

/**
 * Get all public sites
 *
 * @param {Object} state  Global state tree
 * @return {Array}        Site objects
 */
export default createSelector(
	( state ) => {
		return Object.values( state.sites.items )
			.filter( site => ! site.is_private )
			.map( site => getSite( state, site.ID ) );
	},
	( state ) => [ state.sites.items, state.currentUser.capabilities ]
);
