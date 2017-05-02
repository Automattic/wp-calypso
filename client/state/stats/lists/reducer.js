/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { merge, get } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { isValidStateWithSchema } from 'state/utils';
import { getSerializedStatsQuery } from './utils';
import { itemSchema } from './schema';
import {
	DESERIALIZE,
	SITE_STATS_RECEIVE,
	SITE_STATS_REQUEST,
	SITE_STATS_REQUEST_FAILURE,
	SITE_STATS_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID, post ID and stat keys to the request stats.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const requests = createReducer( {}, {
	[ SITE_STATS_REQUEST ]: ( state, { siteId, statType, query } ) => {
		const queryKey = getSerializedStatsQuery( query );
		return merge( {}, state, {
			[ siteId ]: {
				[ statType ]: {
					[ queryKey ]: { requesting: true, status: 'pending' }
				}
			}
		} );
	},
	[ SITE_STATS_REQUEST_SUCCESS ]: ( state, { siteId, statType, query, date } ) => {
		const queryKey = getSerializedStatsQuery( query );
		return merge( {}, state, {
			[ siteId ]: {
				[ statType ]: {
					[ queryKey ]: { requesting: false, status: 'success', date }
				}
			}
		} );
	},
	[ SITE_STATS_REQUEST_FAILURE ]: ( state, { siteId, statType, query } ) => {
		const queryKey = getSerializedStatsQuery( query );
		return merge( {}, state, {
			[ siteId ]: {
				[ statType ]: {
					[ queryKey ]: { requesting: false, status: 'error' }
				}
			}
		} );
	}
} );

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID, statType and and serialized query key to the stat payload.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case SITE_STATS_RECEIVE:
			const { siteId, statType, query, data } = action;
			const queryKey = getSerializedStatsQuery( query );

			const newQueries = {
				...get( state, [ siteId, statType ], null ),
				[ queryKey ]: data
			};

			const newStatType = {
				...get( state, [ siteId ], null ),
				[ statType ]: newQueries
			};

			return {
				...state,
				[ siteId ]: newStatType
			};

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, itemSchema ) ) {
				return state;
			}

			return {};
	}

	return state;
}

export default combineReducers( {
	requests,
	items
} );
