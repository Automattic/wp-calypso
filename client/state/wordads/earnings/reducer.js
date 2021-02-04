/**
 * External dependencies
 */
import { keyedReducer } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { WORDADS_EARNINGS_RECEIVE } from 'calypso/state/action-types';

export const items = keyedReducer( 'siteId', ( state, action ) => {
	switch ( action.type ) {
		case WORDADS_EARNINGS_RECEIVE:
			return action.earnings;
		default:
			return state;
	}
} );

export default items;
