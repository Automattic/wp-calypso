/** @format */

/**
 * Internal dependencies
 */
import { MEMBERSHIPS_EARNINGS_RECEIVE } from 'state/action-types';
import { createReducer, combineReducers } from 'state/utils';

const summary = createReducer(
	{
		forecast: 0,
		last_month: 0,
		total: 0,
	},
	{
		[ MEMBERSHIPS_EARNINGS_RECEIVE ]: ( state, data ) => data.earnings,
	}
);

export default combineReducers( {
	summary,
} );
