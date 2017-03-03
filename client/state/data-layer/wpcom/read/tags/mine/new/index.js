/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_FOLLOW_TAG_REQUEST } from 'state/action-types';
import {
	receiveTags as receiveTagsAction,
} from 'state/reader/tags/items/actions';

import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { fromApi } from 'state/data-layer/wpcom/read/tags/utils';

export function requestFollowTag( store, action, next ) {
	store.dispatch( http( {
		path: `/read/tags/${ action.payload.slug }/mine/new`,
		method: 'POST',
		apiVersion: '1.0',
		onSuccess: action,
		onFailure: action,
	} ) );

	next( action );
}

export function receiveFollowTag( store, action, next, apiResponse ) {
	// TODO: is this a good thing to do here?
	if ( apiResponse.subscribed === false ) {
		return receiveError( store, action, next );
	}
	const normalizedTags = fromApi( apiResponse );
	const followedTag = {
		...find( normalizedTags, { id: apiResponse.added_tag } ),
		isFollowing: true,
	};

	store.dispatch( receiveTagsAction( {
		payload: [ followedTag ],
		error: false,
	} ) );
}

export function receiveError( store, action, next, error ) {
	// TODO dispatch notice;
//	store.dispatch( 'warnign', action, next, error );
}

export default {
	[ READER_FOLLOW_TAG_REQUEST ]: [ dispatchRequest( requestFollowTag, receiveFollowTag, receiveError ) ],
};
