/**
 * Internal dependencies
 */

import { combineReducers, keyedReducer } from 'calypso/state/utils';
import {
	ZONINATOR_REQUEST_FEED,
	ZONINATOR_REQUEST_FEED_ERROR,
	ZONINATOR_SAVE_FEED,
	ZONINATOR_UPDATE_FEED,
	ZONINATOR_UPDATE_FEED_ERROR,
} from '../action-types';

const isRequesting = ( state = {}, action ) => {
	switch ( action.type ) {
		case ZONINATOR_REQUEST_FEED:
			return true;
		case ZONINATOR_REQUEST_FEED_ERROR:
			return false;
		case ZONINATOR_UPDATE_FEED:
			return false;
	}

	return state;
};

export const requesting = keyedReducer( 'siteId', keyedReducer( 'zoneId', isRequesting ) );

const feed = ( state = {}, action ) => {
	switch ( action.type ) {
		case ZONINATOR_UPDATE_FEED: {
			const { posts } = action;
			return posts;
		}
	}

	return state;
};

export const items = keyedReducer( 'siteId', keyedReducer( 'zoneId', feed ) );

const savingFeed = ( state = {}, action ) => {
	switch ( action.type ) {
		case ZONINATOR_SAVE_FEED: {
			return true;
		}
		case ZONINATOR_UPDATE_FEED:
		case ZONINATOR_UPDATE_FEED_ERROR: {
			return false;
		}
	}

	return state;
};

export const saving = keyedReducer( 'siteId', keyedReducer( 'zoneId', savingFeed ) );

export default combineReducers( {
	items,
	requesting,
	saving,
} );
