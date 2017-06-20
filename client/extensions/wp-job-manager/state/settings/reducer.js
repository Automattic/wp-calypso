/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { itemsSchema } from './schema';
import {
	WP_JOB_MANAGER_DISPLAY_SETTINGS,
	WP_JOB_MANAGER_ENABLE_SETTINGS,
	WP_JOB_MANAGER_FETCH_SETTINGS,
} from '../action-types';

/**
 * Returns the updated FETCHing state after an action has been dispatched.
 * FETCHing state tracks whether a settings FETCH is in progress for a site.
 *
 * @param  {Object} state Current FETCHing state
 * @param  {Object} action Action object
 * @return {Object} Updated FETCHing state
 */
export const fetching = createReducer( {}, {
	[ WP_JOB_MANAGER_FETCH_SETTINGS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_JOB_MANAGER_ENABLE_SETTINGS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

/**
 * Tracks the settings for a particular site.
 *
 * @param  {Object} state Current settings
 * @param  {Object} action Action object
 * @return {Object} Updated settings
 */
export const items = createReducer( {}, {
	[ WP_JOB_MANAGER_DISPLAY_SETTINGS ]: ( state, { siteId, data } ) => ( { ...state, [ siteId ]: data } ),
}, itemsSchema );

export default combineReducers( {
	fetching,
	items,
} );
