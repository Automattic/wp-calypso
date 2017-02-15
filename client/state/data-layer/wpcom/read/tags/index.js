/**
 * Internal dependencies
 */
import {
	READER_FETCH_TAGS_REQUEST,
	READER_FETCH_TAG_REQUEST,
} from 'state/action-types';
import {
	receiveTags,
	receiveTag,
} from 'state/reader/tags/items/actions';

import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

export function requestTag( store, action, next ) {
	store.dispatch( http( {
		path: `/read/tags/${ action.payload.slug }`,
		method: 'GET',
		apiVersion: '1.2',
		onSuccess: action,
		onFailure: action,
	} ) );

	next( action );
}

export function receiveTagSuccess( store, action, next, apiResponse ) {
	store.dispatch( receiveTag( { payload: apiResponse, error: false } ) );
}

export function receiveTagError( store, action, next, error ) {
	store.dispatch( receiveTag( { payload: error, error: true } ) );
}

export function requestTags( store, action, next ) {
	store.dispatch( http( {
		path: '/read/tags',
		method: 'GET',
		apiVersion: '1.2',
		onSuccess: action,
		onFailure: action,
	} ) );

	next( action );
}

export function receiveTagsSuccess( store, action, next, apiResponse ) {
	store.dispatch( receiveTags( { payload: apiResponse, error: false } ) );
}

export function receiveTagsError( store, action, next, error ) {
	store.dispatch( receiveTags( { payload: error, error: true } ) );
}

export default {
	[ READER_FETCH_TAGS_REQUEST ]: [ dispatchRequest( requestTags, receiveTagsSuccess, receiveTagsSuccess ) ],
	[ READER_FETCH_TAG_REQUEST ]: [ dispatchRequest( requestTag, receiveTagSuccess, receiveTagError, ) ]
};

