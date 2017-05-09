/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { statsSchema } from './schema';
import {
	WP_SUPER_CACHE_DELETE_FILE,
	WP_SUPER_CACHE_DELETE_FILE_FAILURE,
	WP_SUPER_CACHE_DELETE_FILE_SUCCESS,
	WP_SUPER_CACHE_RECEIVE_STATS,
	WP_SUPER_CACHE_GENERATE_STATS,
	WP_SUPER_CACHE_GENERATE_STATS_FAILURE,
	WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
	WP_SUPER_CACHE_REMOVE_FILE,
} from '../action-types';

/**
 * Returns the updated stats generation state after an action has been dispatched.
 * Stats generation state tracks whether the stats for a site are currently being generated.
 *
 * @param  {Object} state Current stats generation state
 * @param  {Object} action Action object
 * @return {Object} Updated stats generation state
 */
const generateStatus = createReducer( {}, {
	[ WP_SUPER_CACHE_GENERATE_STATS ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			generating: true,
			status: 'pending',
		}
	} ),
	[ WP_SUPER_CACHE_GENERATE_STATS_SUCCESS ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			generating: false,
			status: 'success',
		}
	} ),
	[ WP_SUPER_CACHE_GENERATE_STATS_FAILURE ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			generating: false,
			status: 'error',
		}
	} )
} );

/**
 * Returns the updated deleting state after an action has been dispatched.
 * Deleting state tracks whether a cached file for a site is currently being deleted.
 *
 * @param  {Object} state Current deleting state
 * @param  {Object} action Action object
 * @return {Object} Updated deleting state
 */
const deleteStatus = createReducer( {}, {
	[ WP_SUPER_CACHE_DELETE_FILE ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			deleting: true,
			status: 'pending',
		}
	} ),
	[ WP_SUPER_CACHE_DELETE_FILE_SUCCESS ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			deleting: false,
			status: 'success',
		}
	} ),
	[ WP_SUPER_CACHE_DELETE_FILE_FAILURE ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			deleting: false,
			status: 'error',
		}
	} )
} );

/**
 * Tracks the stats for a particular site.
 *
 * @param  {Object} state Current stats
 * @param  {Object} action Action object
 * @return {Object} Updated stats
 */
const items = createReducer( {}, {
	[ WP_SUPER_CACHE_RECEIVE_STATS ]: ( state, { siteId, stats } ) => ( { ...state, [ siteId ]: stats } ),
	[ WP_SUPER_CACHE_REMOVE_FILE ]: ( state, { siteId, url, isSupercache, isCached } ) => {
		const cacheType = isSupercache ? 'supercache' : 'wpcache';
		const listType = isCached ? 'cached_list' : 'expired_list';
		const countType = isCached ? 'cached' : 'expired';
		// Get the files property of the stat that is about to be removed.
		const file = state[ siteId ][ cacheType ][ listType ].filter( item => item.dir === url );
		const fileCount = file.length ? get( file[ 0 ], 'files', 0 ) : 0;

		return ( {
			...state,
			[ siteId ]: {
				...state[ siteId ],
				[ cacheType ]: {
					...state[ siteId ][ cacheType ],
					[ countType ]: state[ siteId ][ cacheType ][ countType ] - fileCount,
					[ listType ]: state[ siteId ][ cacheType ][ listType ].filter( item => item.dir !== url ),
				},
			}
		} );
	},
}, statsSchema );

export default combineReducers( {
	deleteStatus,
	generateStatus,
	items,
} );
