/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_FOLLOW_TAG_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { fromApi } from 'state/data-layer/wpcom/read/tags/utils';
import { errorNotice } from 'state/notices/actions';
import { receiveTags as receiveTagsAction } from 'state/reader/tags/items/actions';

export function requestFollowTag( store, action ) {
	store.dispatch(
		http( {
			path: `/read/tags/${ action.payload.slug }/mine/new`,
			method: 'POST',
			apiVersion: '1.1',
			onSuccess: action,
			onFailure: action,
		} )
	);
}

export function receiveFollowTag( store, action, apiResponse ) {
	if ( apiResponse.subscribed === false ) {
		receiveError( store, action );
		return;
	}

	const normalizedTags = fromApi( apiResponse );
	const followedTag = {
		...find( normalizedTags, { id: apiResponse.added_tag } ),
		isFollowing: true,
	};

	store.dispatch(
		receiveTagsAction( {
			payload: [ followedTag ],
		} )
	);
}

export function receiveError( store, action, error ) {
	// exit early and do nothing if the error is that the user is already following the tag
	if ( error && error.error === 'already_subscribed' ) {
		return;
	}

	const errorText = translate( 'Could not follow tag: %(tag)s', {
		args: { tag: action.payload.slug },
	} );

	store.dispatch( errorNotice( errorText ) );
	if ( process.env.NODE_ENV === 'development' ) {
		console.error( errorText, error ); // eslint-disable-line no-console
	}
}

export default {
	[ READER_FOLLOW_TAG_REQUEST ]: [
		dispatchRequest( requestFollowTag, receiveFollowTag, receiveError ),
	],
};
