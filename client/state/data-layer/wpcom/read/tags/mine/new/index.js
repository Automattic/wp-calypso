import { translate } from 'i18n-calypso';
import { find } from 'lodash';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { fromApi as transformTagFromApi } from 'calypso/state/data-layer/wpcom/read/tags/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { READER_FOLLOW_TAG_REQUEST } from 'calypso/state/reader/action-types';
import { receiveTags as receiveTagsAction } from 'calypso/state/reader/tags/items/actions';

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
		// eslint-disable-next-line no-console
		console.error( errorText, error );
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
