import { WORDADS_PAYMENTS_RECEIVE } from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

export const items = keyedReducer( 'siteId', ( state, action ) => {
	switch ( action.type ) {
		case WORDADS_PAYMENTS_RECEIVE:
			return action.payments;
		default:
			return state;
	}
} );

export default items;
