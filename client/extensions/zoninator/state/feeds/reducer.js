/**
 * Internal dependencies
 */

import { combineReducers, keyedReducer, withoutPersistence } from 'calypso/state/utils';
import {
	ZONINATOR_REQUEST_FEED,
	ZONINATOR_REQUEST_FEED_ERROR,
	ZONINATOR_UPDATE_FEED,
} from '../action-types';

const isRequesting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case ZONINATOR_REQUEST_FEED:
			return true;
		case ZONINATOR_REQUEST_FEED_ERROR:
			return false;
		case ZONINATOR_UPDATE_FEED:
			return false;
	}

	return state;
} );

export const requesting = keyedReducer( 'siteId', keyedReducer( 'zoneId', isRequesting ) );

const feed = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case ZONINATOR_UPDATE_FEED: {
			const { posts } = action;
			return posts;
		}
	}

	return state;
} );

export const items = keyedReducer( 'siteId', keyedReducer( 'zoneId', feed ) );

export default combineReducers( {
	requesting,
	items,
} );
