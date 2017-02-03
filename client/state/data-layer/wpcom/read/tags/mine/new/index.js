/**
 * Internal dependencies
 */
import { READER_FOLLOW_TAG_REQUEST } from 'state/action-types';
import { receiveFollowTag, } from 'state/reader/tags/items/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

export function requestFollow( store, action, next ) {
	store.dispatch( http( {
		path: `/read/tags/${ action.payload.slug }/mine/new`,
		method: 'POST',
		apiVersion: '1.2',
		onSuccess: action,
		onFailure: action,
	} ) );

	next( action );
}

export function receiveFollowSuccess( store, action, next, apiResponse ) {
	store.dispatch( receiveFollowTag( { payload: apiResponse, error: false } ) );
}

export function receiveFollowError( store, action, next, error ) {
	store.dispatch( receiveFollowTag( { payload: error, error: true } ) );
}

export default {
	[ READER_FOLLOW_TAG_REQUEST ]: [
		dispatchRequest( requestFollow, receiveFollowSuccess, receiveFollowError ),
	],
};
