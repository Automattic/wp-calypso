/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import {
	assign,
	identity,
	keyBy,
	omit
} from 'lodash';

/**
 * Internal dependencies
 */
import {
	DISCUSSIONS_ITEM_EDIT_CONTENT_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_REMOVE,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_UNLIKE_REQUEST_SUCCESS,
	DISCUSSIONS_REQUEST,
	DISCUSSIONS_REQUEST_SUCCESS,
} from 'state/action-types';
import {
	createReducer,
	keyedReducer,
} from 'state/utils';

const updateCommentLike = ( state, { commentId, iLike, likeCount } ) => ( {
	...state,
	...keyBy( [ { ...state[ commentId ], iLike, likeCount } ], 'ID' )
} );

export const items = keyedReducer( 'siteId', createReducer( {}, {
	[ DISCUSSIONS_ITEM_EDIT_CONTENT_REQUEST_SUCCESS ]: ( state, { commentId, content } ) => ( {
		...state,
		...keyBy( [ { ...state[ commentId ], content } ], 'ID' )
	} ),
	[ DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS ]: updateCommentLike,
	[ DISCUSSIONS_ITEM_UNLIKE_REQUEST_SUCCESS ]: updateCommentLike,
	[ DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS ]: ( state, { commentId, status } ) => ( {
		...state,
		...keyBy( [ { ...state[ commentId ], status } ], 'ID' )
	} ),
	[ DISCUSSIONS_ITEM_REMOVE ]: ( state, { commentId } ) => assign( {}, omit( state, commentId ) ),
	[ DISCUSSIONS_REQUEST ]: identity,
	[ DISCUSSIONS_REQUEST_SUCCESS ]: ( state, { comments } ) => ( { ...state, ...keyBy( comments, 'ID' ) } )
} ) );

export default combineReducers( { items } );
