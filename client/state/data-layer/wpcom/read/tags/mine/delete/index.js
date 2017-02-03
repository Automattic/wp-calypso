/**
 * Internal dependencies
 */
import { READER_UNFOLLOW_TAG_REQUEST } from 'state/action-types';
import { receiveUnfollowTag, } from 'state/reader/tags/items/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

export function requestUnfollow( store, action, next ) {
	store.dispatch( http( {
		path: `/read/tags/${ action.payload.slug }/mine/delete`,
		method: 'POST',
		apiVersion: '1.2',
		onSuccess: action,
		onFailure: action,
	} ) );

	next( action );
}

export function receiveUnfollowSuccess( store, action, next, apiResponse ) {
	store.dispatch( receiveUnfollowTag( { payload: apiResponse, error: false } ) );
}

export function receiveUnfollowError( store, action, next, error ) {
	store.dispatch( receiveUnfollowTag( { payload: error, error: true } ) );
}

export default {
	[ READER_UNFOLLOW_TAG_REQUEST ]: [
		dispatchRequest( requestUnfollow, receiveUnfollowSuccess, receiveUnfollowError ),
	],
};

