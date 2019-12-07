/** @format */

/**
 * Internal dependencies
 */

import { combineReducers, createReducer } from 'state/utils';
import { MAILCHIMP_SETTINGS_RECEIVE, MAILCHIMP_SETTINGS_UPDATE_SUCCESS } from 'state/action-types';

export const items = createReducer(
	{},
	{
		[ MAILCHIMP_SETTINGS_RECEIVE ]: ( state, { siteId, settings } ) => ( {
			...state,
			[ siteId ]: settings,
		} ),
		[ MAILCHIMP_SETTINGS_UPDATE_SUCCESS ]: ( state, { siteId, settings } ) => ( {
			...state,
			[ siteId ]: settings,
		} ),
	}
);

export default combineReducers( {
	items,
} );
