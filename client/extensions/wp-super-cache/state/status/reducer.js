/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation, withoutPersistence } from 'calypso/state/utils';
import { itemsSchema } from './schema';
import {
	WP_SUPER_CACHE_RECEIVE_STATUS,
	WP_SUPER_CACHE_REQUEST_STATUS,
	WP_SUPER_CACHE_REQUEST_STATUS_FAILURE,
} from '../action-types';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a status request is in progress for a site.
 *
 * @param  {object} state Current requesting state
 * @param  {object} action Action object
 * @returns {object} Updated requesting state
 */
const requesting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_RECEIVE_STATUS: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
		case WP_SUPER_CACHE_REQUEST_STATUS: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case WP_SUPER_CACHE_REQUEST_STATUS_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
	}

	return state;
} );

/**
 * Tracks the status for a particular site.
 *
 * @param  {object} state Current status
 * @param  {object} action Action object
 * @returns {object} Updated status
 */
const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_RECEIVE_STATUS:
			return {
				...state,
				[ action.siteId ]: action.status,
			};
	}

	return state;
} );

export default combineReducers( {
	items,
	requesting,
} );
