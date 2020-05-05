/**
 * External dependencies
 */
import { sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';
import createSelector from 'lib/create-selector';
import getSitesItems from 'state/selectors/get-sites-items';

/**
 * Get the newest site of the current user
 *
 * @param {object} state  Global state tree
 * @returns {object}       Site object
 */
export default createSelector(
	( state ) => {
		const newestSite = sortBy( Object.values( getSitesItems( state ) ), 'ID' ).pop();

		if ( ! newestSite ) {
			return null;
		}

		return getSite( state, newestSite.ID );
	},
	( state ) => [ getSitesItems( state ), state.currentUser.capabilities ]
);
