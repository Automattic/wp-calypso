/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation, withoutPersistence } from 'calypso/state/utils';
import { statsSchema } from './schema';
import {
	WP_SUPER_CACHE_DELETE_CACHE_SUCCESS,
	WP_SUPER_CACHE_DELETE_FILE,
	WP_SUPER_CACHE_DELETE_FILE_FAILURE,
	WP_SUPER_CACHE_DELETE_FILE_SUCCESS,
	WP_SUPER_CACHE_GENERATE_STATS,
	WP_SUPER_CACHE_GENERATE_STATS_FAILURE,
	WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
} from '../action-types';

/**
 * Returns the updated generating state after an action has been dispatched.
 * Generating state tracks whether the stats for a site are currently being generated.
 *
 * @param  {object} state Current generating state
 * @param  {object} action Action object
 * @returns {object} Updated generating state
 */
export const generating = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_GENERATE_STATS: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case WP_SUPER_CACHE_GENERATE_STATS_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
		case WP_SUPER_CACHE_GENERATE_STATS_SUCCESS: {
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
 * Returns the updated deleting state after an action has been dispatched.
 * Deleting state tracks whether a cached file for a site is currently being deleted.
 *
 * @param  {object} state Current deleting state
 * @param  {object} action Action object
 * @returns {object} Updated deleting state
 */
const deleting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_DELETE_FILE: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case WP_SUPER_CACHE_DELETE_FILE_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
		case WP_SUPER_CACHE_DELETE_FILE_SUCCESS: {
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
 * Tracks the stats for a particular site.
 *
 * @param  {object} state Current stats
 * @param  {object} action Action object
 * @returns {object} Updated stats
 */
const items = withSchemaValidation( statsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case WP_SUPER_CACHE_GENERATE_STATS_SUCCESS: {
			const { siteId, stats } = action;

			return {
				...state,
				[ siteId ]: stats,
			};
		}
		case WP_SUPER_CACHE_DELETE_CACHE_SUCCESS: {
			const { siteId, deleteExpired } = action;
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
				},
			};
		}
		case WP_SUPER_CACHE_DELETE_FILE_SUCCESS: {
			const { siteId, url, isSupercache, isCached } = action;
			const cacheType = isSupercache ? 'supercache' : 'wpcache';
			const listType = isCached ? 'cached_list' : 'expired_list';
			const countType = isCached ? 'cached' : 'expired';
			// Store the object whose key is given by `url` in the `file` var, and all other files in `remainingFiles`.
			const { [ url ]: file, ...remainingFiles } = state[ siteId ][ cacheType ][ listType ];
			const fileCount = get( file, 'files', 0 );

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ cacheType ]: {
						...state[ siteId ][ cacheType ],
						[ countType ]: state[ siteId ][ cacheType ][ countType ] - fileCount,
						[ listType ]: remainingFiles,
					},
				},
			};
		}
	}

	return state;
} );

export default combineReducers( {
	deleting,
	generating,
	items,
} );
