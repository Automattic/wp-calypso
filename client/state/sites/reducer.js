/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { plans } from './plans/reducer';
import { RECEIVE_SITE } from 'state/action-types';

/**
 * Tracks all known site objects, indexed by site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case RECEIVE_SITE:
			state = Object.assign( {}, state, {
				[ action.site.ID ]: action.site
			} );
			break;
	}

	return state;
}

export default combineReducers( {
	items,
	plans
} );
