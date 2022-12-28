import { get, sortBy, merge } from 'lodash';
import {
	EMAIL_STATS_RECEIVE,
	EMAIL_STATS_REQUEST,
	EMAIL_STATS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { items as itemSchemas } from './schema';

/**
 * Returns a serialized stats query, used as the key in the
 * `state.stats.lists.items` and `state.stats.lists.requesting` state objects.
 *
 * @param   {object} query    Stats query
 * @returns {string}          Serialized stats query
 */
export function getSerializedStatsQuery( query = {} ) {
	return JSON.stringify( sortBy( Object.entries( query ), ( pair ) => pair[ 0 ] ) );
}

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID, post ID and stat keys to the request stats.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const requests = ( state = {}, action ) => {
	switch ( action.type ) {
		case EMAIL_STATS_REQUEST: {
			const { siteId, postId, period, statType } = action;
			return merge( {}, state, {
				[ siteId ]: {
					[ postId ]: {
						[ period ]: {
							[ statType ]: { requesting: true, status: 'pending' },
						},
					},
				},
			} );
		}
		case EMAIL_STATS_RECEIVE: {
			const { siteId, postId, period, statType } = action;
			return merge( {}, state, {
				[ siteId ]: {
					[ postId ]: {
						[ period ]: {
							[ statType ]: { requesting: false, status: 'success' },
						},
					},
				},
			} );
		}
		case EMAIL_STATS_REQUEST_FAILURE: {
			const { siteId, postId, period, statType } = action;
			return merge( {}, state, {
				[ siteId ]: {
					[ postId ]: {
						[ period ]: {
							[ statType ]: { requesting: false, status: 'error' },
						},
					},
				},
			} );
		}
	}

	return state;
};

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID, email ID and stat keys to the value of the stat.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( itemSchemas, ( state = {}, action ) => {
	switch ( action.type ) {
		case EMAIL_STATS_RECEIVE:
			return {
				...state,
				[ action.siteId ]: {
					...get( state, [ action.siteId ], {} ),
					[ action.postId ]: {
						[ action.period ]: {
							[ action.statType ]: {
								...get( state, [ action.siteId, action.postId ], {} ),
								...action.stats,
							},
						},
					},
				},
			};
	}

	return state;
} );

export default combineReducers( {
	items,
	requests,
} );
