/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_FOLLOW_TAG_REQUEST } from 'state/reader/action-types';
import { receiveTags as receiveTagsAction } from 'state/reader/tags/items/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { fromApi as transformTagFromApi } from 'state/data-layer/wpcom/read/tags/utils';
import { errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';

import { registerHandlers } from 'state/data-layer/handler-registry';

export function requestFollowTag( action ) {
	return http( {
		path: `/read/tags/${ action.payload.slug }/mine/new`,
		method: 'POST',
		apiVersion: '1.1',
		onSuccess: action,
		onFailure: action,
	} );
}

function fromApi( response ) {
	if ( response.subscribed === false ) {
		throw new Error( `following tag failed with response: ${ JSON.stringify( response ) }` );
	}

	const addedTag = find( response.tags, { ID: response.added_tag } );

	return transformTagFromApi( { tag: addedTag } ).map( ( tag ) => ( {
		...tag,
		isFollowing: true,
	} ) );
}

export function receiveFollowTag( action, addedTag ) {
	return receiveTagsAction( {
		payload: addedTag,
	} );
}

export function receiveError( action, error ) {
	// exit early and do nothing if the error is that the user is already following the tag
	if ( error && error.error === 'already_subscribed' ) {
		return;
	}

	const errorText = translate( 'Could not follow tag: %(tag)s', {
		args: { tag: action.payload.slug },
	} );

	if ( process.env.NODE_ENV === 'development' ) {
		console.error( errorText, error ); // eslint-disable-line no-console
	}

	return errorNotice( errorText );
}

registerHandlers( 'state/data-layer/wpcom/read/tags/mine/new/index.js', {
	[ READER_FOLLOW_TAG_REQUEST ]: [
		dispatchRequest( {
			fetch: requestFollowTag,
			onSuccess: receiveFollowTag,
			onError: receiveError,
			fromApi,
		} ),
	],
} );
