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
import { errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';

export function requestFollowTag( store, action, next ) {
	store.dispatch( http( {
		path: `/read/tags/${ action.payload.slug }/mine/new`,
		method: 'POST',
		apiVersion: '1.1',
		onSuccess: action,
		onFailure: action,
	} ) );

	next( action );
}

export function receiveFollowTag( store, action, next, apiResponse ) {
	if ( apiResponse.subscribed === false ) {
		receiveError( store, action, next );
		return;
	}

	const normalizedTags = fromApi( apiResponse );
	const followedTag = {
		...find( normalizedTags, { id: apiResponse.added_tag } ),
		isFollowing: true,
	};

	store.dispatch( receiveTagsAction( {
		payload: [ followedTag ],
	} ) );
}

export function receiveError( store, action, next, error ) {
	const errorText = translate( 'Could not follow tag: %(tag)', { tag: action.payload.slug } );
	store.dispatch( errorNotice( errorText ) );
	if ( process.env.NODE_ENV === 'development' ) {
		console.error( errorText, error ); // eslint-disable-line no-console
	}
}

export default {
	[ READER_FOLLOW_TAG_REQUEST ]: [ dispatchRequest( requestFollowTag, receiveFollowTag, receiveError ) ],
};
