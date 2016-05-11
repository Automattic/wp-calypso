/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	ADWORDS_SITE_APPROVE_REQUEST,
	ADWORDS_SITE_APPROVE_REQUEST_SUCCESS,
	ADWORDS_SITE_APPROVE_REQUEST_FAILURE,
	ADWORDS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

/**
 * Tracks all known user objects, indexed by user ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */

const initialState = {
	requesting: false,
	error: null
};

export function requestStatus( state = initialState, action ) {
	switch ( action.type ) {
		case ADWORDS_SITE_APPROVE_REQUEST:
			return { requesting: true, error: null };
		case ADWORDS_SITE_APPROVE_REQUEST_SUCCESS:
			return { requesting: false, error: null };
		case ADWORDS_SITE_APPROVE_REQUEST_FAILURE:
			return { requesting: false, error: action.error };
		case ADWORDS_SITE_APPROVE_REQUEST_DISMISS_ERROR:
			return Object.assign( {}, state, { error: null } );
		case DESERIALIZE:
			return {};
		case SERIALIZE:
			return {};
	}

	return state;
}

export default combineReducers( {
	requestStatus
} );
