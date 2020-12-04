/**
 * Internal dependencies
 */
import {
	USER_SUGGESTIONS_RECEIVE,
	USER_SUGGESTIONS_REQUEST,
	USER_SUGGESTIONS_REQUEST_FAILURE,
	USER_SUGGESTIONS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation, withoutPersistence } from 'calypso/state/utils';
import { itemsSchema } from './schema';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a user suggestions request is in progress for a site.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action object
 * @returns {object}        Updated state
 */
export const requesting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case USER_SUGGESTIONS_REQUEST: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case USER_SUGGESTIONS_REQUEST_FAILURE: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
		case USER_SUGGESTIONS_REQUEST_SUCCESS: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
	}

	return state;
} );

/**
 * Returns the updated items state after an action has been dispatched. Items
 * state tracks an array of user suggestions available for a site. Receiving
 * user suggestions for a site will replace the existing set.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action object
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case USER_SUGGESTIONS_RECEIVE: {
			const { siteId, suggestions } = action;
			return { ...state, [ siteId ]: suggestions || [] };
		}
	}

	return state;
} );

export default combineReducers( {
	requesting,
	items,
} );
