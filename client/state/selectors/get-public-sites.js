/** @format */

/**
 * Internal dependencies
 */
import { getSitesItems } from 'client/state/selectors';
import { getSite } from 'client/state/sites/selectors';
import createSelector from 'client/lib/create-selector';

/**
 * Get all public sites
 *
 * @param {Object} state  Global state tree
 * @return {Array}        Site objects
 */
export default createSelector(
	state =>
		Object.values( getSitesItems( state ) )
			.filter( site => ! site.is_private )
			.map( site => getSite( state, site.ID ) ),
	state => [ getSitesItems( state ), state.currentUser.capabilities ]
);
