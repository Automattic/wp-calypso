/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { itemsSchema } from './schema';
import {
	WP_JOB_MANAGER_FETCH_ERROR,
	WP_JOB_MANAGER_FETCH_SETTINGS,
	WP_JOB_MANAGER_SAVE_ERROR,
	WP_JOB_MANAGER_SAVE_SETTINGS,
	WP_JOB_MANAGER_SAVE_SUCCESS,
	WP_JOB_MANAGER_UPDATE_SETTINGS,
} from '../action-types';

/**
 * Returns the updated fetching state after an action has been dispatched.
 * Fetching state tracks whether a settings fetch is in progress for a site.
 *
 * @param  {Object} state Current fetching state
 * @param  {Object} action Action object
 * @return {Object} Updated fetching state
 */
export const fetching = createReducer( {}, {
	[ WP_JOB_MANAGER_FETCH_SETTINGS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_JOB_MANAGER_UPDATE_SETTINGS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_JOB_MANAGER_FETCH_ERROR ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
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
	fetching,
	items,
	saving,
} );
