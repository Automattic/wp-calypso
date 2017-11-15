/** @format */

/**
 * Internal dependencies
 */

import { combineReducers, createReducer } from 'state/utils';
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
export const requesting = createReducer(
	{},
	{
		[ WP_SUPER_CACHE_REQUEST_PLUGINS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
		[ WP_SUPER_CACHE_REQUEST_PLUGINS_FAILURE ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: false,
		} ),
		[ WP_SUPER_CACHE_REQUEST_PLUGINS_SUCCESS ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: false,
		} ),
	}
);

/**
 * Returns the updated plugin toggling state after an action has been dispatched.
 * Toggling state tracks whether a WPSC plugin on a site is currently being toggled.
 *
 * @param  {Object} state Current toggling state
 * @param  {Object} action Action object
 * @return {Object} Updated saving state
 */
export const toggling = createReducer(
	{},
	{
		[ WP_SUPER_CACHE_TOGGLE_PLUGIN ]: ( state, { siteId, plugin } ) => ( {
			...state,
			[ siteId ]: {
				[ plugin ]: true,
			},
		} ),
		[ WP_SUPER_CACHE_TOGGLE_PLUGIN_SUCCESS ]: ( state, { siteId, plugin } ) => ( {
			...state,
			[ siteId ]: {
				[ plugin ]: false,
			},
		} ),
		[ WP_SUPER_CACHE_TOGGLE_PLUGIN_FAILURE ]: ( state, { siteId, plugin } ) => ( {
			...state,
			[ siteId ]: {
				[ plugin ]: false,
			},
		} ),
	}
);

/**
 * Tracks the plugins for a particular site.
 *
 * @param  {Object} state Current plugins
 * @param  {Object} action Action object
 * @return {Object} Updated plugins
 */
export const items = createReducer(
	{},
	{
		[ WP_SUPER_CACHE_RECEIVE_PLUGINS ]: ( state, { siteId, plugins } ) => ( {
			...state,
			[ siteId ]: plugins,
		} ),
	},
	itemsSchema
);

export default combineReducers( {
	items,
	requesting,
	toggling,
} );
