/** @format */

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
 * @param  {Boolean} state Current fetching state
 * @param  {Object}  action Action object
 * @return {Object}  Updated fetching state
 */
export const fetching = ( state = false, { type } ) => {
	switch ( type ) {
		case WP_JOB_MANAGER_FETCH_SETTINGS:
			return true;

		case WP_JOB_MANAGER_FETCH_ERROR:
		case WP_JOB_MANAGER_UPDATE_SETTINGS:
			return false;

		default:
			return state;
	}
};

/**
 * Tracks the settings for a particular site.
 *
 * @param  {Object} state Current settings
 * @param  {Object} action Action object
 * @return {Object} Updated settings
 */
export const items = ( state = {}, { data, type } ) =>
	WP_JOB_MANAGER_UPDATE_SETTINGS === type ? data : state;

items.schema = itemsSchema;

export default keyedReducer(
	'siteId',
	combineReducers( {
		fetching,
		items,
	} )
);
