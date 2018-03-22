/** @format */

/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import suggestions from './suggestions/reducer';
import { combineReducers } from 'state/utils';
import { USER_RECEIVE, USER_DELETE_RECEIVE } from 'state/action-types';

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

		case USER_DELETE_RECEIVE:
			return omit( state, action.userId );
	}

	return state;
}

export default combineReducers( {
	items,
	suggestions,
} );
