/**
 * Internal dependencies
 */

import { combineReducers, withSchemaValidation, withoutPersistence } from 'state/utils';
import { itemsSchema } from './schema';
import {
	WP_SUPER_CACHE_RECEIVE_PLUGINS,
	WP_SUPER_CACHE_REQUEST_PLUGINS,
	WP_SUPER_CACHE_REQUEST_PLUGINS_FAILURE,
	WP_SUPER_CACHE_REQUEST_PLUGINS_SUCCESS,
	WP_SUPER_CACHE_TOGGLE_PLUGIN,
	WP_SUPER_CACHE_TOGGLE_PLUGIN_FAILURE,
	WP_SUPER_CACHE_TOGGLE_PLUGIN_SUCCESS,
} from '../action-types';

/**
 * Returns the updated plugins requesting state after an action has been dispatched.
 * Requesting state tracks whether a plugins request is in progress for a site.
 *
 * @param  {Object} state Current requesting state
 * @param  {Object} action Action object
 * @return {Object} Updated requesting state
 */
export const requesting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_REQUEST_PLUGINS: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case WP_SUPER_CACHE_REQUEST_PLUGINS_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
		case WP_SUPER_CACHE_REQUEST_PLUGINS_SUCCESS: {
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
 * Returns the updated plugin toggling state after an action has been dispatched.
 * Toggling state tracks whether a WPSC plugin on a site is currently being toggled.
 *
 * @param  {Object} state Current toggling state
 * @param  {Object} action Action object
 * @return {Object} Updated saving state
 */
export const toggling = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_TOGGLE_PLUGIN: {
			const { siteId, plugin } = action;

			return {
				...state,
				[ siteId ]: {
					[ plugin ]: true,
				},
			};
		}
		case WP_SUPER_CACHE_TOGGLE_PLUGIN_SUCCESS: {
			const { siteId, plugin } = action;

			return {
				...state,
				[ siteId ]: {
					[ plugin ]: false,
				},
			};
		}
		case WP_SUPER_CACHE_TOGGLE_PLUGIN_FAILURE: {
			const { siteId, plugin } = action;

			return {
				...state,
				[ siteId ]: {
					[ plugin ]: false,
				},
			};
		}
	}

	return state;
} );

/**
 * Tracks the plugins for a particular site.
 *
 * @param  {Object} state Current plugins
 * @param  {Object} action Action object
 * @return {Object} Updated plugins
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_RECEIVE_PLUGINS: {
			const { siteId, plugins } = action;

			return {
				...state,
				[ siteId ]: plugins,
			};
		}
	}

	return state;
} );

export default combineReducers( {
	items,
	requesting,
	toggling,
} );
