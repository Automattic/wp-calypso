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
 * Tracks the settings for a particular site.
 *
 * @param  {String} state Current settings
 * @param  {Object} action Action object
 * @return {String} Updated settings
 */
const items = createReducer( {}, {
	[ WP_SUPER_CACHE_RECEIVE_SETTINGS ]: ( state, { siteId, settings } ) => ( { ...state, [ siteId ]: settings } )
}, settingsSchema );

export default combineReducers( {
	items,
	requesting,
} );
