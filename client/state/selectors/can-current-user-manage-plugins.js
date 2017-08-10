/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { canCurrentUser } from 'state/selectors';

/**
 * Returns true if user can manage plugins for at least one site and returns false otherwise
 *
 * @param {Object} state  Global state tree
 * @return {Boolean} Whether the user can manage plugins or not
 */
export default createSelector( state => {
	const siteIds = Object.keys( get( state, 'currentUser.capabilities', {} ) );
	return siteIds.some( siteId => canCurrentUser( state, siteId, 'manage_options' ) );
}, state => state.currentUser.capabilities );
