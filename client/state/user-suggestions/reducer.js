import { withStorageKey } from '@automattic/state-utils';
import {
	USER_SUGGESTIONS_RECEIVE,
	USER_SUGGESTIONS_REQUEST,
	USER_SUGGESTIONS_REQUEST_FAILURE,
	USER_SUGGESTIONS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { itemsSchema } from './schema';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a user suggestions request is in progress for a site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @returns {Object}        Updated state
 */
export const requesting = ( state = {}, action ) => {
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
};

/**
 * Returns the updated items state after an action has been dispatched. Items
 * state tracks an array of user suggestions available for a site. Receiving
 * user suggestions for a site will replace the existing set.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @returns {Object}        Updated state
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

const combinedReducer = combineReducers( {
	requesting,
	items,
} );

export default withStorageKey( 'userSuggestions', combinedReducer );
