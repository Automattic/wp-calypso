/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';

/**
 * Internal dependencies
 */
import {
	READER_START_RECOMMENDATIONS_RECEIVE,
	READER_START_RECOMMENDATIONS_REQUEST,
	READER_START_RECOMMENDATIONS_REQUEST_SUCCESS,
	READER_START_RECOMMENDATIONS_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { itemsSchema } from './schema';
import { isValidStateWithSchema } from 'state/utils';

/**
 * Tracks all known list objects, indexed by list ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case READER_START_RECOMMENDATIONS_RECEIVE:
			return Object.assign( {}, state, keyBy( action.recommendations, 'site_ID' ) );
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			if ( ! isValidStateWithSchema( state, itemsSchema ) ) {
				return {};
			}
			return state;
	}
	return state;
}

/**
 * Returns the updated requests state after an action has been dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isRequestingRecommendations( state = false, action ) {
	switch ( action.type ) {
		case READER_START_RECOMMENDATIONS_REQUEST:
		case READER_START_RECOMMENDATIONS_REQUEST_SUCCESS:
		case READER_START_RECOMMENDATIONS_REQUEST_FAILURE:
			return READER_START_RECOMMENDATIONS_REQUEST === action.type;

		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
}

export default combineReducers( {
	items,
	isRequestingRecommendations
} );
