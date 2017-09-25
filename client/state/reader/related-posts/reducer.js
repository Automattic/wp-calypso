/** @format */
/**
 * External dependencies
 */
import { assign, map, partial } from 'lodash';

/**
 * Internal dependencies
 */
import { key } from './utils';
import { READER_RELATED_POSTS_RECEIVE, READER_RELATED_POSTS_REQUEST, READER_RELATED_POSTS_REQUEST_SUCCESS, READER_RELATED_POSTS_REQUEST_FAILURE } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

export const items = createReducer(
	{},
	{
		[ READER_RELATED_POSTS_RECEIVE ]: ( state, action ) => {
			state = assign( {}, state, {
				[ key( action.payload.siteId, action.payload.postId, action.payload.scope ) ]: map(
					action.payload.posts,
					'global_ID'
				),
			} );
			return state;
		},
	}
);

function setRequestFlag( val, state, action ) {
	const { siteId, postId, scope } = action.payload;
	return assign( {}, state, {
		[ key( siteId, postId, scope ) ]: val,
	} );
}

export const queuedRequests = createReducer(
	{},
	{
		[ READER_RELATED_POSTS_REQUEST ]: partial( setRequestFlag, true ),
		[ READER_RELATED_POSTS_REQUEST_SUCCESS ]: partial( setRequestFlag, false ),
		[ READER_RELATED_POSTS_REQUEST_FAILURE ]: partial( setRequestFlag, false ),
	}
);

export default combineReducers( {
	items,
	queuedRequests,
} );
