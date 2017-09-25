/**
 * Internal dependencies
 */
import { WP_JOB_MANAGER_FETCH_ERROR, WP_JOB_MANAGER_FETCH_SETTINGS, WP_JOB_MANAGER_UPDATE_SETTINGS } from '../action-types';
import { itemsSchema } from './schema';
import { combineReducers, createReducer } from 'state/utils';

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
} );
