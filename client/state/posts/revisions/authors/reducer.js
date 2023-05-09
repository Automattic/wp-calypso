import { reduce } from 'lodash';
import { POST_REVISION_AUTHORS_RECEIVE } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

/**
 * Tracks all known user objects, indexed by user ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
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
