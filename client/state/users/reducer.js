/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

import suggestions from './suggestions/reducer';
import { combineReducers } from 'calypso/state/utils';
import { CURRENT_USER_RECEIVE } from 'calypso/state/action-types';

/**
 * Tracks user objects, indexed by user ID.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case CURRENT_USER_RECEIVE:
			return Object.assign( {}, state, {
				[ action.user.ID ]: action.user,
			} );
	}

	return state;
}

export default combineReducers( {
	items,
	suggestions,
} );
