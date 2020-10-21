/**
 * External Dependencies
 */
import { assign, map, partial } from 'lodash';

/**
 * Internal Dependencies
 */
import { combineReducers, withoutPersistence } from 'calypso/state/utils';
import {
	READER_RELATED_POSTS_RECEIVE,
	READER_RELATED_POSTS_REQUEST,
	READER_RELATED_POSTS_REQUEST_SUCCESS,
	READER_RELATED_POSTS_REQUEST_FAILURE,
} from 'calypso/state/reader/action-types';
import { key } from './utils';

export const items = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_RELATED_POSTS_RECEIVE: {
			state = assign( {}, state, {
				[ key( action.payload.siteId, action.payload.postId, action.payload.scope ) ]: map(
					action.payload.posts,
					'global_ID'
				),
			} );
			return state;
		}
	}

	return state;
} );

function setRequestFlag( val, state, action ) {
	const { siteId, postId, scope } = action.payload;
	return assign( {}, state, {
		[ key( siteId, postId, scope ) ]: val,
	} );
}

export const queuedRequests = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_RELATED_POSTS_REQUEST:
			return partial( setRequestFlag, true )( state, action );
		case READER_RELATED_POSTS_REQUEST_SUCCESS:
			return partial( setRequestFlag, false )( state, action );
		case READER_RELATED_POSTS_REQUEST_FAILURE:
			return partial( setRequestFlag, false )( state, action );
	}

	return state;
} );

export default combineReducers( {
	items,
	queuedRequests,
} );
