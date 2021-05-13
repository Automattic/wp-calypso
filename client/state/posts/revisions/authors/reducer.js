/**
 * External dependencies
 */
import { reduce } from 'lodash';

/**
 * Internal dependencies
 */

import { combineReducers } from 'calypso/state/utils';
import { POST_REVISION_AUTHORS_RECEIVE } from 'calypso/state/action-types';

/**
 * Tracks all known user objects, indexed by user ID.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case POST_REVISION_AUTHORS_RECEIVE:
			return reduce(
				action.users,
				( newState, user ) => {
					if ( newState === state ) {
						newState = { ...state };
					}
					newState[ user.ID ] = user;
					return newState;
				},
				state
			);
	}

	return state;
}

export default combineReducers( {
	items,
} );
