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
	USER_SUGGESTIONS_REQUEST_FAILURE,
	USER_SUGGESTIONS_REQUEST_SUCCESS,
} from 'state/action-types';
import { createReducer } from 'state/utils';
import { itemsSchema } from './schema';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a user suggestions request is in progress for a site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export const requesting = createReducer( {}, {
	[ USER_SUGGESTIONS_REQUEST ]: ( state, { siteId } ) => {
		return { ...state, [ siteId ]: true };
	},
	[ USER_SUGGESTIONS_REQUEST_FAILURE ]: ( state, { siteId } ) => {
		return { ...state, [ siteId ]: false };
	},
	[ USER_SUGGESTIONS_REQUEST_SUCCESS ]: ( state, { siteId } ) => {
		return { ...state, [ siteId ]: false };
	},
} );

/**
 * Returns the updated items state after an action has been dispatched. Items
 * state tracks an array of user suggestions available for a site. Receiving
 * user suggestions for a site will replace the existing set.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export const items = createReducer( {}, {
	[ USER_SUGGESTIONS_RECEIVE ]: ( state, { siteId, suggestions } ) => {
		return { ...state, [ siteId ]: suggestions };
	},
}, itemsSchema );

export default combineReducers( {
	requesting,
	items,
} );
