/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	USER_SUGGESTIONS_RECEIVE,
	USER_SUGGESTIONS_REQUEST,
	USER_SUGGESTIONS_REQUEST_SUCCESS,
	USER_SUGGESTIONS_REQUEST_FAILURE
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID keys to whether a request for user suggestions is in progress.
 *
 * @param  {Object} state   Current state
 * @param  {Object} action  Action payload
 * @return {Object}         Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case USER_SUGGESTIONS_REQUEST:
		case USER_SUGGESTIONS_REQUEST_SUCCESS:
		case USER_SUGGESTIONS_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: USER_SUGGESTIONS_REQUEST === action.type
			} );
	}

	return state;
}

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an array of user suggestions.
 *
 * @param  {Object} state   Current state
 * @param  {Object} action  Action payload
 * @return {Object}         Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case USER_SUGGESTIONS_RECEIVE:
			return Object.assign( {}, state, {
				[ action.siteId ]: action.suggestions
			} );
	}

	return state;
}

export default combineReducers( {
	requesting,
	items
} );
