/** @format */

/**
 * Internal dependencies
 */

import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	ZONINATOR_REQUEST_FEED,
	ZONINATOR_REQUEST_FEED_ERROR,
	ZONINATOR_UPDATE_FEED,
} from '../action-types';

const isRequesting = createReducer(
	{},
	{
		[ ZONINATOR_REQUEST_FEED ]: () => true,
		[ ZONINATOR_REQUEST_FEED_ERROR ]: () => false,
		[ ZONINATOR_UPDATE_FEED ]: () => false,
	}
);

export const requesting = keyedReducer( 'siteId', keyedReducer( 'zoneId', isRequesting ) );

const feed = createReducer(
	{},
	{
		[ ZONINATOR_UPDATE_FEED ]: ( state, { posts } ) => posts,
	}
);

export const items = keyedReducer( 'siteId', keyedReducer( 'zoneId', feed ) );

export default combineReducers( {
	requesting,
	items,
} );
