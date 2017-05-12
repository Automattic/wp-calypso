/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WP_SUPER_CACHE_DELETE_CACHE,
	WP_SUPER_CACHE_DELETE_CACHE_FAILURE,
	WP_SUPER_CACHE_DELETE_CACHE_SUCCESS,
	WP_SUPER_CACHE_RECEIVE_TEST_CACHE_RESULTS,
	WP_SUPER_CACHE_TEST_CACHE,
	WP_SUPER_CACHE_TEST_CACHE_FAILURE,
	WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
} from '../action-types';

/**
 * Returns the updated deleting state after an action has been dispatched.
 * Deleting state tracks whether the cache for a site is currently being deleted.
 *
 * @param  {Object} state Current deleting state
 * @param  {Object} action Action object
 * @return {Object} Updated deleting state
 */
const deleteStatus = createReducer( {}, {
	[ WP_SUPER_CACHE_DELETE_CACHE ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			deleting: true,
			status: 'pending',
		}
	} ),
	[ WP_SUPER_CACHE_DELETE_CACHE_SUCCESS ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			deleting: false,
			status: 'success',
		}
	} ),
	[ WP_SUPER_CACHE_DELETE_CACHE_FAILURE ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			deleting: false,
			status: 'error',
		}
	} )
} );

/**
 * Returns the updated cache testing state after an action has been dispatched.
 * Testing state tracks whether the cache test for a site is currently in progress.
 *
 * @param  {Object} state Current cache testing state
 * @param  {Object} action Action object
 * @return {Object} Updated cache testing state
 */
const testStatus = createReducer( {}, {
	[ WP_SUPER_CACHE_TEST_CACHE ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			testing: true,
			status: 'pending',
		}
	} ),
	[ WP_SUPER_CACHE_TEST_CACHE_SUCCESS ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			testing: false,
			status: 'success',
		}
	} ),
	[ WP_SUPER_CACHE_TEST_CACHE_FAILURE ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			testing: false,
			status: 'error',
		}
	} )
} );

/**
 * Tracks the cache test results for a particular site.
 *
 * @param  {Object} state Current cache test results
 * @param  {Object} action Action object
 * @return {Object} Updated cache test results
 */
const items = createReducer( {}, {
	[ WP_SUPER_CACHE_RECEIVE_TEST_CACHE_RESULTS ]: ( state, { siteId, results } ) => ( { ...state, [ siteId ]: results } ),
} );

export default combineReducers( {
	deleteStatus,
	items,
	testStatus,
} );
