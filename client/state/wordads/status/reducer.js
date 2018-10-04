/** @format */

/**
 * Internal dependencies
 */

import { WORDADS_STATUS_RECEIVE } from 'state/action-types';
import { keyedReducer } from 'state/utils';
import { wordadsStatusSchema } from './schema';

export const items = keyedReducer( 'siteId', ( state, action ) => {
	switch ( action.type ) {
		case WORDADS_STATUS_RECEIVE:
			return action.status;
		default:
			return state;
	}
} );

items.schema = wordadsStatusSchema;

export default items;
