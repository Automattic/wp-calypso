/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { statsSchema } from './schema';
import {
	WP_SUPER_CACHE_RECEIVE_STATS,
	WP_SUPER_CACHE_GENERATE_STATS,
	WP_SUPER_CACHE_GENERATE_STATS_FAILURE,
	WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
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
 * Tracks the stats for a particular site.
 *
 * @param  {Object} state Current stats
 * @param  {Object} action Action object
 * @return {Object} Updated stats
 */
const items = createReducer( {}, {
	[ WP_SUPER_CACHE_RECEIVE_STATS ]: ( state, { siteId, stats } ) => ( { ...state, [ siteId ]: stats } ),
}, statsSchema );

export default combineReducers( {
	generateStatus,
	items,
} );
