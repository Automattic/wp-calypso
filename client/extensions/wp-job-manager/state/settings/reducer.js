/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { itemsSchema } from './schema';
import {
	WP_JOB_MANAGER_REQUEST_SETTINGS,
	WP_JOB_MANAGER_REQUEST_SETTINGS_ERROR,
	WP_JOB_MANAGER_SAVE_ERROR,
	WP_JOB_MANAGER_SAVE_SETTINGS,
	WP_JOB_MANAGER_SAVE_SUCCESS,
	WP_JOB_MANAGER_UPDATE_SETTINGS,
} from '../action-types';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether the settings for a site are being fetched.
 *
 * @param  {Object} state Current requesting state
 * @param  {Object} action Action object
 * @return {Object} Updated requesting state
 */
export const requesting = createReducer( {}, {
	[ WP_JOB_MANAGER_REQUEST_SETTINGS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_JOB_MANAGER_UPDATE_SETTINGS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_JOB_MANAGER_REQUEST_SETTINGS_ERROR ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
} );

/**
 * Returns the updated saving state after an action has been dispatched.
 * Saving state tracks whether the settings for a site are currently being saved.
 *
 * @param  {Object} state Current saving state
 * @param  {Object} action Action object
 * @return {Object} Updated saving state
 */
export const saving = createReducer( {}, {
	[ WP_JOB_MANAGER_SAVE_SETTINGS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_JOB_MANAGER_SAVE_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_JOB_MANAGER_SAVE_ERROR ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
} );

/**
 * Tracks the settings for a particular site.
 *
 * @param  {Object} state Current settings
 * @param  {Object} action Action object
 * @return {Object} Updated settings
 */
export const items = createReducer( {}, {
	[ WP_JOB_MANAGER_UPDATE_SETTINGS ]: ( state, { siteId, data } ) => ( { ...state, [ siteId ]: data } ),
}, itemsSchema );

export default combineReducers( {
	items,
	requesting,
	saving,
} );
