/**
 * Internal dependencies
 */
import { READER_FETCH_TAG_REQUEST } from 'state/action-types';
import { receiveTag, } from 'state/reader/tags/items/actions';
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

export function receiveResponse( store, action, next, apiResponse ) {
	store.dispatch( receiveTag( { payload: { tag: apiResponse.tag }, error: false } ) );
	next( action );
}

export function receiveError( store, action, next, error ) {
	store.dispatch( receiveTag( { payload: error, error: true } ) );
	next( action );
}

export default {
	[ READER_FETCH_TAG_REQUEST ]: [ dispatchRequest( requestTag, receiveResponse, receiveError ) ]
};

