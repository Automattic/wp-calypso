/**
 * Internal dependencies
 */
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { getSite } from 'calypso/state/sites/selectors';
import createSelector from 'calypso/lib/create-selector';

/**
 * Get all public sites
 *
 * @param {object} state  Global state tree
 * @returns {Array}        Site objects
 */
export default createSelector(
	( state ) =>
		Object.values( getSitesItems( state ) )
			.filter( ( site ) => ! site.is_private )
			.map( ( site ) => getSite( state, site.ID ) ),
	( state ) => [ getSitesItems( state ), state.currentUser.capabilities ]
);
