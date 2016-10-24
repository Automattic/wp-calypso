/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import merge from 'lodash/merge';

/**
 * Internal dependencies
 */
import { isValidStateWithSchema } from 'state/utils';
import { getSerializedStatsQuery } from './utils';
import { itemSchema } from './schema';
import {
	DESERIALIZE,
	SERIALIZE,
	SITE_STATS_RECEIVE,
	SITE_STATS_REQUEST,
	SITE_STATS_REQUEST_FAILURE,
	SITE_STATS_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID, post ID and stat keys to whether a request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case SITE_STATS_REQUEST:
		case SITE_STATS_REQUEST_SUCCESS:
		case SITE_STATS_REQUEST_FAILURE:
			const queryKey = getSerializedStatsQuery( action.query );
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.statType ]: {
						[ queryKey ]: SITE_STATS_REQUEST === action.type
					}
				}
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

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
			const queryKey = getSerializedStatsQuery( action.query );
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.statType ]: {
						[ queryKey ]: action.data
					}
				}
			} );

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, itemSchema ) ) {
				return state;
			}

			return {};
	}

	return state;
}

export default combineReducers( {
	requesting,
	items
} );
