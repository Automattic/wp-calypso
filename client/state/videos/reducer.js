/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	VIDEO_FETCH,
	VIDEO_FETCH_COMPLETED,
	VIDEO_FETCH_FAILED,
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
 * Track the current status for fetching videos. Maps guid to the
 * fetching status for the video corresponding to that guid. Assigns `true` for
 * currently fetching,  `false` for done or failed fetching,
 * or `undefined` if no fetch attempt has been made for the video.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function fetchingVideo( state = {}, action ) {
	switch ( action.type ) {
		case VIDEO_FETCH:
		case VIDEO_FETCH_COMPLETED:
		case VIDEO_FETCH_FAILED:
			return Object.assign( {}, state, {
				[ action.guid ]: VIDEO_FETCH === action.type
			} );
	}
	return state;
}

export default combineReducers( {
	items,
	fetchingVideo
} );
