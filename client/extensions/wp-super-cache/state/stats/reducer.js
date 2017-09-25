/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { WP_SUPER_CACHE_DELETE_CACHE_SUCCESS, WP_SUPER_CACHE_DELETE_FILE, WP_SUPER_CACHE_DELETE_FILE_FAILURE, WP_SUPER_CACHE_DELETE_FILE_SUCCESS, WP_SUPER_CACHE_GENERATE_STATS, WP_SUPER_CACHE_GENERATE_STATS_FAILURE, WP_SUPER_CACHE_GENERATE_STATS_SUCCESS } from '../action-types';
import { statsSchema } from './schema';
import { combineReducers, createReducer } from 'state/utils';

/**
 * Returns the updated generating state after an action has been dispatched.
 * Generating state tracks whether the stats for a site are currently being generated.
 *
 * @param  {Object} state Current generating state
 * @param  {Object} action Action object
 * @return {Object} Updated generating state
 */
export const generating = createReducer( {}, {
	[ WP_SUPER_CACHE_GENERATE_STATS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_SUPER_CACHE_GENERATE_STATS_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_SUPER_CACHE_GENERATE_STATS_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

/**
 * Returns the updated deleting state after an action has been dispatched.
 * Deleting state tracks whether a cached file for a site is currently being deleted.
 *
 * @param  {Object} state Current deleting state
 * @param  {Object} action Action object
 * @return {Object} Updated deleting state
 */
const deleting = createReducer( {}, {
	[ WP_SUPER_CACHE_DELETE_FILE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_SUPER_CACHE_DELETE_FILE_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_SUPER_CACHE_DELETE_FILE_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

/**
 * Tracks the stats for a particular site.
 *
 * @param  {Object} state Current stats
 * @param  {Object} action Action object
 * @return {Object} Updated stats
 */
const items = createReducer( {}, {
	[ WP_SUPER_CACHE_GENERATE_STATS_SUCCESS ]: ( state, { siteId, stats } ) => ( { ...state, [ siteId ]: stats } ),
	[ WP_SUPER_CACHE_DELETE_CACHE_SUCCESS ]: ( state, { siteId, deleteExpired } ) => {
		let emptyCache = {
			expired: 0,
			expired_list: {},
		};

		if ( ! deleteExpired ) {
			emptyCache = {
				...emptyCache,
				cached: 0,
				cached_list: {},
			};
		}

		return {
			...state,
			[ siteId ]: {
				supercache: {
					...state[ siteId ].supercache,
					...emptyCache,
				},
				wpcache: {
					...state[ siteId ].wpcache,
					...emptyCache,
				},
			}
		};
	},
	[ WP_SUPER_CACHE_DELETE_FILE_SUCCESS ]: ( state, { siteId, url, isSupercache, isCached } ) => {
		const cacheType = isSupercache ? 'supercache' : 'wpcache';
		const listType = isCached ? 'cached_list' : 'expired_list';
		const countType = isCached ? 'cached' : 'expired';
		// Store the object whose key is given by `url` in the `file` var, and all other files in `remainingFiles`.
		const { [ url ]: file, ...remainingFiles } = state[ siteId ][ cacheType ][ listType ];
		const fileCount = get( file, 'files', 0 );

		return ( {
			...state,
			[ siteId ]: {
				...state[ siteId ],
				[ cacheType ]: {
					...state[ siteId ][ cacheType ],
					[ countType ]: state[ siteId ][ cacheType ][ countType ] - fileCount,
					[ listType ]: remainingFiles,
				},
			}
		} );
	},
}, statsSchema );

export default combineReducers( {
	deleting,
	generating,
	items,
} );
