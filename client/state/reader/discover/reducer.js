/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';

/**
 * Internal dependencies
 */
import {
	READER_DISCOVER_POSTS_RECEIVE,
	READER_DISCOVER_POSTS_REQUEST,
	READER_DISCOVER_POSTS_REQUEST_FAILURE,
	READER_DISCOVER_POSTS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

function items( state = {}, action ) {
	switch ( action.type ) {
		case READER_DISCOVER_POSTS_RECEIVE:
			return { ...state, ...keyBy( action.discoverPosts, 'global_ID' ) };
		case SERIALIZE:
		case DESERIALIZE:
			return [];
	}
	return state;
}

function isRequestingDiscoveryPosts( state = false, action ) {
	switch ( action.type ) {
		case READER_DISCOVER_POSTS_RECEIVE:
		case READER_DISCOVER_POSTS_REQUEST:
		case READER_DISCOVER_POSTS_REQUEST_SUCCESS:
		case READER_DISCOVER_POSTS_REQUEST_FAILURE:
			return READER_DISCOVER_POSTS_REQUEST === action.type;
		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}
	return state;
}

export default combineReducers( {
	items,
	isRequestingDiscoveryPosts
} );
