/**
 * External Dependencies
 */
import { combineReducers } from 'redux';
import assign from 'lodash/assign';
import partial from 'lodash/partial';
import map from 'lodash/map';

/**
 * Internal Dependencies
 */
import { createReducer } from 'state/utils';
import {
	READER_RELATED_POSTS_RECEIVE,
	READER_RELATED_POSTS_REQUEST,
	READER_RELATED_POSTS_REQUEST_SUCCESS,
	READER_RELATED_POSTS_REQUEST_FAILURE
} from 'state/action-types';
import { key } from './utils';

export const items = createReducer( {}, {
	[ READER_RELATED_POSTS_RECEIVE ]: ( state, action ) => {
		state = assign( {}, state, {
			[ key( action.payload.siteId, action.payload.postId ) ]: map( action.payload.posts, 'global_ID' )
		} );
		return state;
	}
} );

function setRequestFlag( val, state, action ) {
	return assign( {}, state, {
		[ key( action.payload.siteId, action.payload.postId ) ]: val
	} );
}

export const queuedRequests = createReducer( {}, {
	[ READER_RELATED_POSTS_REQUEST ]: partial( setRequestFlag, true ),
	[ READER_RELATED_POSTS_REQUEST_SUCCESS ]: partial( setRequestFlag, false ),
	[ READER_RELATED_POSTS_REQUEST_FAILURE ]: partial( setRequestFlag, false )
} );

export default combineReducers( {
	items,
	queuedRequests
} );
