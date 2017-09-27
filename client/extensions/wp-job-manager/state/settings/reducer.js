/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import { itemsSchema } from './schema';
import {
	WP_JOB_MANAGER_FETCH_ERROR,
	WP_JOB_MANAGER_FETCH_SETTINGS,
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
export const fetching = ( state = false, { type } ) => get( {
	[ WP_JOB_MANAGER_FETCH_SETTINGS ]: true,
	[ WP_JOB_MANAGER_FETCH_ERROR ]: false,
	[ WP_JOB_MANAGER_UPDATE_SETTINGS ]: false,
}, type, state );

/**
 * Tracks the settings for a particular site.
 *
 * @param  {Object} state Current settings
 * @param  {Object} action Action object
 * @return {Object} Updated settings
 */
export const items = ( state = {}, { data, type } ) =>
	WP_JOB_MANAGER_UPDATE_SETTINGS === type
		? data
		: state;

items.schema = itemsSchema;

export default keyedReducer( 'siteId', combineReducers( {
	fetching,
	items,
} ) );
