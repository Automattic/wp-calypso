/** @format */

/**
 * Internal dependencies
 */

import { combineReducers, createReducer } from 'state/utils';
import { MAILCHIMP_LISTS_RECEIVE } from 'state/action-types';

export const items = createReducer(
	{},
	{
		[ MAILCHIMP_LISTS_RECEIVE ]: ( state, { siteId, lists } ) => ( {
			...state,
			[ siteId ]: lists,
		} ),
	}
);

export default combineReducers( {
	items,
} );
