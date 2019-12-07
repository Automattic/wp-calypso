/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

import suggestions from './suggestions/reducer';
import { combineReducers } from 'state/utils';
import { CURRENT_USER_RECEIVE } from 'state/action-types';

/**
 * Tracks user objects, indexed by user ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
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
