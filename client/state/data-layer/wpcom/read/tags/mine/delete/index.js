/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { READER_UNFOLLOW_TAG_REQUEST } from 'state/action-types';
import {
	receiveUnfollowTag as receiveUnfollowTagAction,
} from 'state/reader/tags/items/actions';

import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';

export function requestUnfollow( store, action, next ) {
	store.dispatch( http( {
		path: `/read/tags/${ action.payload.slug }/mine/delete`,
		method: 'POST',
		apiVersion: '1.0',
		onSuccess: action,
		onFailure: action,
	} ) );

	next( action );
}

/**
 * Normalize response from the api. The only thing we care about is the removed_tag so only keep that.
 *
 * @param  {RemovedTag} apiResponse api response from the unfollow
 * @return {Number} the ID of the tag that was removed
 */
export const fromApi = apiResponse => apiResponse.removed_tag;

export function receiveUnfollowTag( store, action, next, apiResponse ) {
	if ( apiResponse.subscribed ) {
		receiveError( store, action, next, 'apiResponse.subcribed = true' );
		return;
	}

	store.dispatch( receiveUnfollowTagAction( {
		payload: fromApi( apiResponse ),
	} ) );
}

export function receiveError( store, action, next, error ) {
	store.dispatch( errorNotice( 'Could not unfollow tag' ) );
	if ( process.env.NODE_ENV === 'development' ) {
		throw new Error( error );
	}
}

export default {
	[ READER_UNFOLLOW_TAG_REQUEST ]: [ dispatchRequest( requestUnfollow, receiveUnfollowTag, receiveError ) ],
};
