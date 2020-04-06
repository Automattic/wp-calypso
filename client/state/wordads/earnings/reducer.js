/**
 * Internal dependencies
 */

import { WORDADS_EARNINGS_RECEIVE } from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const items = keyedReducer( 'siteId', ( state, action ) => {
	switch ( action.type ) {
		case WORDADS_EARNINGS_RECEIVE:
			return action.earnings;
		default:
			return state;
	}
} );

export default items;
