/** @format */

/**
 * Internal dependencies
 */

import {
	WORDADS_EARNINGS_REQUEST,
	WORDADS_EARNINGS_REQUEST_SUCCESS,
	WORDADS_EARNINGS_REQUEST_FAILURE,
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

export const items = createReducer(
	{},
	{
		[ WORDADS_EARNINGS_REQUEST_SUCCESS ]: ( state, action ) =>
			Object.assign( {}, state, {
				[ action.siteId ]: action.earnings,
			} ),
	}
);

export const fetchingItems = createReducer(
	{},
	{
		[ WORDADS_EARNINGS_REQUEST ]: ( state, action ) =>
			Object.assign( {}, state, { [ action.siteId ]: true } ),
		[ WORDADS_EARNINGS_REQUEST_SUCCESS ]: ( state, action ) =>
			Object.assign( {}, state, { [ action.siteId ]: false } ),
		[ WORDADS_EARNINGS_REQUEST_FAILURE ]: ( state, action ) =>
			Object.assign( {}, state, { [ action.siteId ]: false } ),
	}
);

export default combineReducers( {
	items,
	fetchingItems,
} );
