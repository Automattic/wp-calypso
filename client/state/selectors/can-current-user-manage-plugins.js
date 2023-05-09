import { createSelector } from '@automattic/state-utils';
import { get } from 'lodash';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';

/**
 * Returns true if user can manage plugins for at least one site and returns false otherwise
 *
 * @param {Object} state  Global state tree
 * @returns {boolean} Whether the user can manage plugins or not
 */
export default createSelector(
	( state ) => {
		const siteIds = Object.keys( get( state, 'currentUser.capabilities', {} ) );
		return siteIds.some( ( siteId ) => canCurrentUser( state, siteId, 'manage_options' ) );
	},
	( state ) => state.currentUser.capabilities
);
