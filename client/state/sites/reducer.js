/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { plans } from './plans/reducer';
import { SITE_RECEIVE, SERIALIZE, DESERIALIZE } from 'state/action-types';

/**
 * Tracks all known site objects, indexed by site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case SITE_RECEIVE:
			return Object.assign( {}, state, {
				[ action.site.ID ]: action.site
			} );
		case SERIALIZE:
			return {};
		case DESERIALIZE:
			return {};
	}
	return state;
}

export default combineReducers( {
	items,
	plans
} );
