/** @format */

/**
 * External dependencies
 */
import { reduce } from 'lodash';

/**
 * Internal dependencies
 */

import suggestions from './suggestions/reducer';
import { combineReducers } from 'state/utils';
import { USER_RECEIVE, USERS_RECEIVE } from 'state/action-types';

/**
 * Tracks all known user objects, indexed by user ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case USER_RECEIVE:
			return Object.assign( {}, state, {
				[ action.user.ID ]: action.user,
			} );

		case USERS_RECEIVE:
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
	suggestions,
} );
