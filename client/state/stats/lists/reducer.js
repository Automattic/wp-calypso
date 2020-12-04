/* eslint-disable no-case-declarations */
/**
 * External dependencies
 */
import { merge, get } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation, withoutPersistence } from 'calypso/state/utils';
import { getSerializedStatsQuery } from './utils';
import { itemSchema } from './schema';
import {
	SITE_STATS_RECEIVE,
	SITE_STATS_REQUEST,
	SITE_STATS_REQUEST_FAILURE,
} from 'calypso/state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID, post ID and stat keys to the request stats.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const requests = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_STATS_REQUEST: {
			const { siteId, statType, query } = action;
			const queryKey = getSerializedStatsQuery( query );
			return merge( {}, state, {
				[ siteId ]: {
					[ statType ]: {
						[ queryKey ]: { requesting: true, status: 'pending' },
					},
				},
			} );
		}
		case SITE_STATS_RECEIVE: {
			const { siteId, statType, query, date } = action;
			const queryKey = getSerializedStatsQuery( query );
			return merge( {}, state, {
				[ siteId ]: {
					[ statType ]: {
						[ queryKey ]: { requesting: false, status: 'success', date },
					},
				},
			} );
		}
		case SITE_STATS_REQUEST_FAILURE: {
			const { siteId, statType, query } = action;
			const queryKey = getSerializedStatsQuery( query );
			return merge( {}, state, {
				[ siteId ]: {
					[ statType ]: {
						[ queryKey ]: { requesting: false, status: 'error' },
					},
				},
			} );
		}
	}

	return state;
} );

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID, statType and and serialized query key to the stat payload.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( itemSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_STATS_RECEIVE:
			const { siteId, statType, query, data } = action;
			const queryKey = getSerializedStatsQuery( query );

			// Build the items state in a way that will preserve all unmodified parts
			// and recreate site -> statType -> queryKey that was currently changed.
			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ statType ]: {
						...get( state, [ siteId, statType ] ),
						[ queryKey ]: data,
					},
				},
			};
	}

	return state;
} );

export default combineReducers( {
	requests,
	items,
} );
