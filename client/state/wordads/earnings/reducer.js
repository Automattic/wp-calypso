/** @format */

/**
 * Internal dependencies
 */

import {
	WORDADS_EARNINGS_REQUEST,
	WORDADS_EARNINGS_REQUEST_SUCCESS,
	WORDADS_EARNINGS_REQUEST_FAILURE,
} from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const items = keyedReducer( 'siteId', ( state, action ) => {
	switch ( action.type ) {
		case WORDADS_EARNINGS_REQUEST_SUCCESS:
			return action.earnings;
		default:
			return state;
	}
} );

export default items;
