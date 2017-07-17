/**
 * External dependencies
 */
import { findIndex } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';

import {
	WP_SUPER_CACHE_DELETE_DEBUG_LOG,
	WP_SUPER_CACHE_DELETE_DEBUG_LOG_FAILURE,
	WP_SUPER_CACHE_DELETE_DEBUG_LOG_SUCCESS,
	WP_SUPER_CACHE_REQUEST_DEBUG_LOGS,
	WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_FAILURE,
	WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_SUCCESS,
	WP_SUPER_CACHE_RECEIVE_SETTINGS,
} from '../action-types';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a debug logs request is in progress for a site.
 *
 * @param  {Object} state Current requesting state
 * @param  {Object} action Action object
 * @return {Object} Updated requesting state
 */
export const requesting = createReducer( {}, {
	[ WP_SUPER_CACHE_REQUEST_DEBUG_LOGS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

/**
 * Returns the updated deleting state after an action has been dispatched.
 * Deleting state tracks whether a debug log is currently being deleted.
 *
 * @param  {Object} state Current deleting state
 * @param  {Object} action Action object
 * @return {Object} Updated deleting state
 */
export const deleteStatus = createReducer( {}, {
	[ WP_SUPER_CACHE_DELETE_DEBUG_LOG ]: ( state, { siteId, filename } ) => ( {
		...state,
		[ siteId ]: {
			...state[ siteId ],
			[ filename ]: true
		}
	} ),
	[ WP_SUPER_CACHE_DELETE_DEBUG_LOG_SUCCESS ]: ( state, { siteId, filename } ) => ( {
		...state,
		[ siteId ]: {
			...state[ siteId ],
			[ filename ]: false
		}
	} ),
	[ WP_SUPER_CACHE_DELETE_DEBUG_LOG_FAILURE ]: ( state, { siteId, filename } ) => ( {
		...state,
		[ siteId ]: {
			...state[ siteId ],
			[ filename ]: false
		}
	} )
} );

/**
 * Tracks the debug logs for a particular site.
 *
 * @param  {Object} state Current debug logs
 * @param  {Object} action Action object
 * @return {Object} Updated debug logs
 */
export const items = createReducer( {}, {
	[ WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_SUCCESS ]: ( state, { siteId, data } ) => ( { ...state, [ siteId ]: data } ),
	[ WP_SUPER_CACHE_DELETE_DEBUG_LOG_SUCCESS ]: ( state, { siteId, filename: deletedFilename } ) => ( {
		...state,
		[ siteId ]: state[ siteId ].filter( ( { filename } ) => ( filename !== deletedFilename ) )
	} ),
	[ WP_SUPER_CACHE_RECEIVE_SETTINGS ]: ( state, {
		siteId,
		settings: {
			wp_super_cache_debug,
			wp_cache_debug_log,
			wp_cache_debug_username,
		}
	} ) => {
		if ( wp_super_cache_debug === true ) {
			const filename = wp_cache_debug_log.split( '/' ).pop();
			const substate = state[ siteId ];
			const index = findIndex( substate, [ 'filename', filename ] );
			let newSubstate;

			if ( index !== -1 ) {
				newSubstate = [
					...substate.slice( 0, index ),
					{
						...substate[ index ],
						active: true,
					},
					...substate.slice( index + 1 )
				];
			} else {
				newSubstate = [
					...substate,
					{
						filename: wp_cache_debug_log.split( '/' ).pop(),
						username: wp_cache_debug_username,
						active: true,
					}
				];
			}
			return {
				...state,
				[ siteId ]: newSubstate,
			};
		}
		return {
			...state,
			[ siteId ]: state[ siteId ].map( debugLog => ( {
				...debugLog,
				active: false,
			} ) )
		};
	}
} );

export default combineReducers( {
	deleteStatus,
	items,
	requesting,
} );
