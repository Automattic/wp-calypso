/**
 * Internal dependencies
 */

import { combineReducers, withoutPersistence } from 'calypso/state/utils';
import {
	WP_SUPER_CACHE_DELETE_CACHE,
	WP_SUPER_CACHE_DELETE_CACHE_FAILURE,
	WP_SUPER_CACHE_DELETE_CACHE_SUCCESS,
	WP_SUPER_CACHE_PRELOAD_CACHE,
	WP_SUPER_CACHE_PRELOAD_CACHE_FAILURE,
	WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS,
	WP_SUPER_CACHE_TEST_CACHE,
	WP_SUPER_CACHE_TEST_CACHE_FAILURE,
	WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
} from '../action-types';

/**
 * Returns the updated deleting state after an action has been dispatched.
 * Deleting state tracks whether the cache for a site is currently being deleted.
 *
 * @param  {object} state Current deleting state
 * @param  {object} action Action object
 * @returns {object} Updated deleting state
 */
const deleteStatus = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_DELETE_CACHE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: {
					deleting: true,
					status: 'pending',
				},
			};
		}
		case WP_SUPER_CACHE_DELETE_CACHE_SUCCESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: {
					deleting: false,
					status: 'success',
				},
			};
		}
		case WP_SUPER_CACHE_DELETE_CACHE_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: {
					deleting: false,
					status: 'error',
				},
			};
		}
	}

	return state;
} );

/**
 * Returns the updated preloading state after an action has been dispatched.
 * Preloading state tracks whether the preload for a site is currently in progress.
 *
 * @param  {object} state Current preloading state
 * @param  {object} action Action object
 * @returns {object} Updated preloading state
 */
const preloading = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_PRELOAD_CACHE: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case WP_SUPER_CACHE_PRELOAD_CACHE_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
		case WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
	}

	return state;
} );

/**
 * Returns the updated cache testing state after an action has been dispatched.
 * Testing state tracks whether the cache test for a site is currently in progress.
 *
 * @param  {object} state Current cache testing state
 * @param  {object} action Action object
 * @returns {object} Updated cache testing state
 */
const testing = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_TEST_CACHE: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case WP_SUPER_CACHE_TEST_CACHE_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
		case WP_SUPER_CACHE_TEST_CACHE_SUCCESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
	}

	return state;
} );

/**
 * Tracks the cache test results for a particular site.
 *
 * @param  {object} state Current cache test results
 * @param  {object} action Action object
 * @returns {object} Updated cache test results
 */
const items = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_TEST_CACHE_SUCCESS: {
			const { siteId, data } = action;

			return {
				...state,
				[ siteId ]: data,
			};
		}
	}

	return state;
} );

export default combineReducers( {
	deleteStatus,
	items,
	preloading,
	testing,
} );
