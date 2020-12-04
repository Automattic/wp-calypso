/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation, withoutPersistence } from 'calypso/state/utils';
import { itemsSchema } from './schema';
import {
	WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS,
	WP_SUPER_CACHE_RECEIVE_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
	WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
	WP_SUPER_CACHE_RESTORE_SETTINGS,
	WP_SUPER_CACHE_RESTORE_SETTINGS_FAILURE,
	WP_SUPER_CACHE_RESTORE_SETTINGS_SUCCESS,
	WP_SUPER_CACHE_SAVE_SETTINGS,
	WP_SUPER_CACHE_SAVE_SETTINGS_FAILURE,
	WP_SUPER_CACHE_SAVE_SETTINGS_SUCCESS,
} from '../action-types';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a settings request is in progress for a site.
 *
 * @param  {object} state Current requesting state
 * @param  {object} action Action object
 * @returns {object} Updated requesting state
 */
const requesting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_REQUEST_SETTINGS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: true,
			};
		}
		case WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
		case WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS: {
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
 * Returns the updated saving state after an action has been dispatched.
 * Saving state tracks whether the settings for a site are currently being saved.
 *
 * @param  {object} state Current saving state
 * @param  {object} action Action object
 * @returns {object} Updated saving state
 */
const saveStatus = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_SAVE_SETTINGS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: {
					saving: true,
					status: 'pending',
					error: false,
				},
			};
		}
		case WP_SUPER_CACHE_SAVE_SETTINGS_SUCCESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: {
					saving: false,
					status: 'success',
					error: false,
				},
			};
		}
		case WP_SUPER_CACHE_SAVE_SETTINGS_FAILURE: {
			const { siteId, error } = action;

			return {
				...state,
				[ siteId ]: {
					saving: false,
					status: 'error',
					error,
				},
			};
		}
	}

	return state;
} );

/**
 * Returns the updated restoring state after an action has been dispatched.
 * Restoring state tracks whether a settings restore request is in progress for a site.
 *
 * @param  {object} state Current restoring state
 * @param  {object} action Action object
 * @returns {object} Updated restoring state
 */
export const restoring = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_RESTORE_SETTINGS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: true,
			};
		}
		case WP_SUPER_CACHE_RESTORE_SETTINGS_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
		case WP_SUPER_CACHE_RESTORE_SETTINGS_SUCCESS: {
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
 * Tracks the settings for a particular site.
 *
 * @param  {object} state Current settings
 * @param  {object} action Action object
 * @returns {object} Updated settings
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_RECEIVE_SETTINGS: {
			const { siteId, settings } = action;

			return {
				...state,
				[ siteId ]: settings,
			};
		}
		case WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS: {
			const { siteId, preloading } = action;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					is_preloading: preloading,
				},
			};
		}
	}

	return state;
} );

export default combineReducers( {
	items,
	requesting,
	restoring,
	saveStatus,
} );
