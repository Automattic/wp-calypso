/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	VIDEO_REQUEST,
	VIDEO_REQUEST_SUCCESS,
	VIDEO_REQUEST_FAILURE,
	VIDEO_RECEIVE
} from 'state/action-types';

/**
 * Returns the updated videos state after an action has been dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case VIDEO_RECEIVE:
			return Object.assign( {}, state, {
				[ action.guid ]: action.data
			} );
	}
	return state;
}

/**
 * Tracks the current status for video requests. Maps guid to the
 * request status for the video corresponding to that guid. Assigns `true` for
 * a request in progress, `false` for successful or failed requests,
 * or `undefined` if no request has been made for the video.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function videoRequests( state = {}, action ) {
	switch ( action.type ) {
		case VIDEO_REQUEST:
		case VIDEO_REQUEST_SUCCESS:
		case VIDEO_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.guid ]: VIDEO_REQUEST === action.type
			} );
	}
	return state;
}

export default combineReducers( {
	items,
	videoRequests
} );
