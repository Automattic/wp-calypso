/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	READER_FETCH_TAG_RECEIVE,
	READER_FETCH_TAGS_RECEIVE,
	READER_FOLLOW_TAG_RECEIVE,
	READER_UNFOLLOW_TAG_RECEIVE,
} from 'state/action-types';
import { createReducer } from 'state/utils';

const items = createReducer( {}, {
	[ READER_FETCH_TAG_RECEIVE ]: ( state, action ) => console.error( action ),
	[ READER_FETCH_TAGS_RECEIVE ]: ( state, action ) => console.error( action ),
	[ READER_FOLLOW_TAG_RECEIVE ]: ( state, action ) => console.error( action ),
	[ READER_UNFOLLOW_TAG_RECEIVE ]: ( state, action ) => console.error( action ),
} );

export default combineReducers( {
	items,
} );
