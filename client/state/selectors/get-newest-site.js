/** @format */

/**
 * External dependencies
 */
import { sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';
import createSelector from 'lib/create-selector';

/**
 * Get the newest site of the current user
 *
 * @param {Object} state  Global state tree
 * @return {Object}       Site object
 */
export default createSelector(
	state => {
		const newestSite = sortBy( Object.values( state.sites.items ), 'ID' ).pop();

		if ( ! newestSite ) {
			return null;
		}

		return getSite( state, newestSite.ID );
	},
	state => [ state.sites.items, state.currentUser.capabilities ]
);
