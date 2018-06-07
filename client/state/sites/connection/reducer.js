/** @format */

/**
 * Internal dependencies
 */

import { combineReducers, createReducer } from 'state/utils';
import { SITE_CONNECTION_STATUS_RECEIVE, SITE_CONNECTION_STATUS_REQUEST } from 'state/action-types';

const createRequestingReducer = requesting => ( state, { siteId } ) => ( {
	...state,
	[ siteId ]: requesting,
} );

export const items = createReducer(
	{},
	{
		[ SITE_CONNECTION_STATUS_RECEIVE ]: ( state, { siteId, status } ) => ( {
			...state,
			[ siteId ]: status,
		} ),
	}
);

export const requesting = createReducer(
	{},
	{
		[ SITE_CONNECTION_STATUS_REQUEST ]: createRequestingReducer( true ),
	}
);

export default combineReducers( {
	items,
	requesting,
} );
