/** @format */

/**
 * Internal dependencies
 */

import { WORDADS_STATS_RECEIVE } from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const items = keyedReducer( 'siteId', ( state, action ) => {
	switch ( action.type ) {
		case WORDADS_STATS_RECEIVE:
			return action.stats;
		default:
			return state;
	}
} );

export default items;
