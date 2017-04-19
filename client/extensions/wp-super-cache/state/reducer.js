/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { settingsSchema } from './schema';
import {
	WP_SUPER_CACHE_RECEIVE_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
	WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
	WP_SUPER_CACHE_SAVE_SETTINGS,
	WP_SUPER_CACHE_SAVE_SETTINGS_FAILURE,
	WP_SUPER_CACHE_SAVE_SETTINGS_SUCCESS,
	WP_SUPER_CACHE_UPDATE_SETTINGS,
} from './action-types';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a settings request is in progress for a site.
 *
 * @param  {Object} state Current requesting state
 * @param  {Object} action Action object
 * @return {Object} Updated requesting state
 */
const requesting = createReducer( {}, {
	[ WP_SUPER_CACHE_REQUEST_SETTINGS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
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
	[ WP_SUPER_CACHE_SAVE_SETTINGS ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			saving: true,
			status: 'pending',
			error: false,
		}
	} ),
	[ WP_SUPER_CACHE_SAVE_SETTINGS_SUCCESS ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			saving: false,
			status: 'success',
			error: false,
		}
	} ),
	[ WP_SUPER_CACHE_SAVE_SETTINGS_FAILURE ]: ( state, { siteId, error } ) => ( {
		...state,
		[ siteId ]: {
			saving: false,
			status: 'error',
			error,
		}
	} )
} );

/**
 * Tracks the settings for a particular site.
 *
 * @param  {Object} state Current settings
 * @param  {Object} action Action object
 * @return {Object} Updated settings
 */
const items = createReducer( {}, {
	[ WP_SUPER_CACHE_RECEIVE_SETTINGS ]: ( state, { siteId, settings } ) => ( { ...state, [ siteId ]: settings } ),
	[ WP_SUPER_CACHE_UPDATE_SETTINGS ]: ( state, { siteId, settings } ) => ( {
		...state,
		[ siteId ]: {
			...state[ siteId ],
			...settings,
		}
	} ),
}, settingsSchema );

export default combineReducers( {
	items,
	requesting,
	saveStatus,
} );
