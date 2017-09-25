/**
 * Internal dependencies
 */
import { WP_SUPER_CACHE_DELETE_CACHE, WP_SUPER_CACHE_DELETE_CACHE_FAILURE, WP_SUPER_CACHE_DELETE_CACHE_SUCCESS, WP_SUPER_CACHE_PRELOAD_CACHE, WP_SUPER_CACHE_PRELOAD_CACHE_FAILURE, WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS, WP_SUPER_CACHE_TEST_CACHE, WP_SUPER_CACHE_TEST_CACHE_FAILURE, WP_SUPER_CACHE_TEST_CACHE_SUCCESS } from '../action-types';
import { combineReducers, createReducer } from 'state/utils';

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
 * Returns the updated preloading state after an action has been dispatched.
 * Preloading state tracks whether the preload for a site is currently in progress.
 * @param  {Object} state Current preloading state
 * @param  {Object} action Action object
 * @return {Object} Updated preloading state
 */
const preloading = createReducer( {}, {
	[ WP_SUPER_CACHE_PRELOAD_CACHE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_SUPER_CACHE_PRELOAD_CACHE_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

/**
 * Returns the updated cache testing state after an action has been dispatched.
 * Testing state tracks whether the cache test for a site is currently in progress.
 *
 * @param  {Object} state Current cache testing state
 * @param  {Object} action Action object
 * @return {Object} Updated cache testing state
 */
const testing = createReducer( {}, {
	[ WP_SUPER_CACHE_TEST_CACHE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_SUPER_CACHE_TEST_CACHE_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_SUPER_CACHE_TEST_CACHE_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

/**
 * Tracks the cache test results for a particular site.
 *
 * @param  {Object} state Current cache test results
 * @param  {Object} action Action object
 * @return {Object} Updated cache test results
 */
const items = createReducer( {}, {
	[ WP_SUPER_CACHE_TEST_CACHE_SUCCESS ]: ( state, { siteId, data } ) => ( { ...state, [ siteId ]: data } ),
} );

export default combineReducers( {
	deleteStatus,
	items,
	preloading,
	testing,
} );
