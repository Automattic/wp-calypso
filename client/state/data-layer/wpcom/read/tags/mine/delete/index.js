/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { READER_UNFOLLOW_TAG_REQUEST } from 'state/reader/action-types';
import { receiveUnfollowTag as receiveUnfollowTagAction } from 'state/reader/tags/items/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';

import { registerHandlers } from 'state/data-layer/handler-registry';

export function requestUnfollow( action ) {
	return http( {
		path: `/read/tags/${ action.payload.slug }/mine/delete`,
		method: 'POST',
		apiVersion: '1.1',
		onSuccess: action,
		onFailure: action,
	} );
}

/**
 * Normalize response from the api. The only thing we care about is the removed_tag so only keep that.
 *
 * @param  {RemovedTag} apiResponse api response from the unfollow
 * @returns {number} the ID of the tag that was removed
 */
export const fromApi = ( apiResponse ) => {
	if ( apiResponse.subscribed ) {
		throw new Error(
			`failed to unsubscribe to tag with response: ${ JSON.stringify( apiResponse ) }`
		);
	}

	return apiResponse.removed_tag;
};

export function receiveUnfollowTag( action, removedTagId ) {
	return receiveUnfollowTagAction( {
		payload: removedTagId,
	} );
}

export function receiveError( action, error ) {
	const errorText = translate( 'Could not unfollow tag: %(tag)s', {
		args: { tag: action.payload.slug },
	} );

	if ( process.env.NODE_ENV === 'development' ) {
		console.error( errorText, error ); // eslint-disable-line no-console
	}
	return errorNotice( errorText );
}

registerHandlers( 'state/data-layer/wpcom/read/tags/mine/delete/index.js', {
	[ READER_UNFOLLOW_TAG_REQUEST ]: [
		dispatchRequest( {
			fetch: requestUnfollow,
			onSuccess: receiveUnfollowTag,
			onError: receiveError,
			fromApi,
		} ),
	],
} );
