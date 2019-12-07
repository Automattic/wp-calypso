/** @format */

/**
 * Internal dependencies
 */
import { MEMBERSHIPS_EARNINGS_RECEIVE } from 'state/action-types';
import { createReducer, combineReducers } from 'state/utils';

const summary = createReducer(
	{},
	{
		[ MEMBERSHIPS_EARNINGS_RECEIVE ]: ( state, data ) => ( {
			...state,
			[ data.siteId ]: data.earnings,
		} ),
	}
);

export default combineReducers( {
	summary,
} );
