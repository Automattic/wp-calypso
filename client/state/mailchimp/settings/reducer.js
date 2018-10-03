/** @format */

/**
 * Internal dependencies
 */

import { combineReducers, createReducer } from 'state/utils';
import { MAILCHIMP_SETTINGS_RECEIVE } from 'state/action-types';

export const items = createReducer(
	{},
	{
		[ MAILCHIMP_SETTINGS_RECEIVE ]: ( state, { siteId, settings } ) => ( {
			...state,
			[ siteId ]: settings,
		} ),
	}
);

export default combineReducers( {
	items,
} );
