/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';

import { itemsSchema } from './schema';
import {
	WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS,
	WP_SUPER_CACHE_RECEIVE_PLUGINS,
	WP_SUPER_CACHE_REQUEST_PLUGINS,
	WP_SUPER_CACHE_REQUEST_PLUGINS_FAILURE,
	WP_SUPER_CACHE_REQUEST_PLUGINS_SUCCESS,
	WP_SUPER_CACHE_RESTORE_SETTINGS,
	WP_SUPER_CACHE_RESTORE_SETTINGS_FAILURE,
	WP_SUPER_CACHE_RESTORE_SETTINGS_SUCCESS,
	WP_SUPER_CACHE_TOGGLE_PLUGIN,
	WP_SUPER_CACHE_TOGGLE_PLUGIN_FAILURE,
	WP_SUPER_CACHE_TOGGLE_PLUGIN_SUCCESS,
} from '../action-types';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a settings request is in progress for a site.
 *
 * @param  {Object} state Current requesting state
 * @param  {Object} action Action object
 * @return {Object} Updated requesting state
 */
const requesting = createReducer( {}, {
	[ WP_SUPER_CACHE_REQUEST_PLUGINS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_SUPER_CACHE_REQUEST_PLUGINS_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_SUPER_CACHE_REQUEST_PLUGINS_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

/**
 * Returns the updated saving state after an action has been dispatched.
 * Saving state tracks whether the settings for a site are currently being saved.
 *
 * @param  {Object} state Current saving state
 * @param  {Object} action Action object
 * @return {Object} Updated saving state
 */
const saveStatus = createReducer( {}, {
	[ WP_SUPER_CACHE_TOGGLE_PLUGIN ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			saving: true,
			status: 'pending',
			error: false,
		}
	} ),
	[ WP_SUPER_CACHE_TOGGLE_PLUGIN_SUCCESS ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			saving: false,
			status: 'success',
			error: false,
		}
	} ),
	[ WP_SUPER_CACHE_TOGGLE_PLUGIN_FAILURE ]: ( state, { siteId, error } ) => ( {
		...state,
		[ siteId ]: {
			saving: false,
			status: 'error',
			error,
		}
	} )
} );

/**
 * Returns the updated restoring state after an action has been dispatched.
 * Restoring state tracks whether a settings restore request is in progress for a site.
 *
 * @param  {Object} state Current restoring state
 * @param  {Object} action Action object
 * @return {Object} Updated restoring state
 */
export const restoring = createReducer( {}, {
	[ WP_SUPER_CACHE_RESTORE_SETTINGS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_SUPER_CACHE_RESTORE_SETTINGS_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_SUPER_CACHE_RESTORE_SETTINGS_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

/**
 * Tracks the settings for a particular site.
 *
 * @param  {Object} state Current settings
 * @param  {Object} action Action object
 * @return {Object} Updated settings
 */
export const items = createReducer( {}, {
	[ WP_SUPER_CACHE_RECEIVE_PLUGINS ]: ( state, { siteId, settings } ) => ( { ...state, [ siteId ]: settings } ),
	[ WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS ]: ( state, { siteId, preloading } ) => ( {
		...state,
		[ siteId ]: {
			...state[ siteId ],
			is_preloading: preloading
		}
	} )
}, itemsSchema );

export default combineReducers( {
	items,
	requesting,
	restoring,
	saveStatus,
} );
