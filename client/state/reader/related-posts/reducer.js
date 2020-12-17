/**
 * Internal Dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import {
	READER_RELATED_POSTS_RECEIVE,
	READER_RELATED_POSTS_REQUEST,
	READER_RELATED_POSTS_REQUEST_SUCCESS,
	READER_RELATED_POSTS_REQUEST_FAILURE,
} from 'calypso/state/reader/action-types';
import { key } from './utils';

function setStateForKey( state, action, val ) {
	const { siteId, postId, scope } = action.payload;
	return {
		...state,
		[ key( siteId, postId, scope ) ]: val,
	};
}

export const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_RELATED_POSTS_RECEIVE:
			return setStateForKey(
				state,
				action,
				action.payload.posts.map( ( p ) => p.global_ID )
			);
	}

	return state;
};

export const queuedRequests = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_RELATED_POSTS_REQUEST:
			return setStateForKey( state, action, true );
		case READER_RELATED_POSTS_REQUEST_SUCCESS:
			return setStateForKey( state, action, false );
		case READER_RELATED_POSTS_REQUEST_FAILURE:
			return setStateForKey( state, action, false );
	}

	return state;
};

export default combineReducers( {
	items,
	queuedRequests,
} );
