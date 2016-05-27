/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	WORDADS_SITE_APPROVE_REQUEST,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_FAILURE,
	WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

/**
 * Tracks all WordAds request status, indexed by site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case WORDADS_SITE_APPROVE_REQUEST:
		case WORDADS_SITE_APPROVE_REQUEST_SUCCESS:
		case WORDADS_SITE_APPROVE_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: action.type === WORDADS_SITE_APPROVE_REQUEST
			} );
			return state;
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

/**
 * Keeps track of all WordAds errors, indexed by siteId
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function errors( state = {}, action ) {
	switch ( action.type ) {
		case WORDADS_SITE_APPROVE_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: action.error
			} );
		case WORDADS_SITE_APPROVE_REQUEST_SUCCESS:
		case WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR:
			return Object.assign( {}, state, {
				[ action.siteId ]: null
			} );
		case DESERIALIZE:
		case SERIALIZE:
			return {};
	}
	return state;
}

export default combineReducers( {
	requesting,
	errors
} );
