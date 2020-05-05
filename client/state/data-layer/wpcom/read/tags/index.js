/**
 * External dependencies
 */
import { map, get } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { READER_TAGS_REQUEST } from 'state/reader/action-types';
import { receiveTags } from 'state/reader/tags/items/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest, getHeaders } from 'state/data-layer/wpcom-http/utils';
import { fromApi } from 'state/data-layer/wpcom/read/tags/utils';
import { errorNotice } from 'state/notices/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export function requestTags( action ) {
	const path =
		action.payload && action.payload.slug ? `/read/tags/${ action.payload.slug }` : '/read/tags';

	return http( {
		path,
		method: 'GET',
		apiVersion: '1.2',
		onSuccess: action,
		onFailure: action,
	} );
}

/*
 * Returns whether or a tags request action corresponds to a request
 * for a user's follows. Its sadly derived instead of explicit.
 * If the payload has an individual slug, then we know it was a request for a specific tag.
 * If the payload does not have a slug, then we assume it was a request for the set of
 *   user's followed tags
 */
const isFollowedTagsRequest = ( action ) => ! get( action, 'payload.slug' );

export function receiveTagsSuccess( action, tags ) {
	const isFollowedTags = isFollowedTagsRequest( action );
	const resetFollowingData = isFollowedTags;

	if ( isFollowedTags ) {
		tags = map( tags, ( tag ) => ( { ...tag, isFollowing: true } ) );
	}

	return receiveTags( { payload: tags, resetFollowingData } );
}

export function receiveTagsError( action, error ) {
	// if tag does not exist, refreshing page wont help
	if ( get( getHeaders( action ), 'status' ) === 404 ) {
		const slug = action.payload.slug;
		return receiveTags( {
			payload: [ { id: slug, slug, error: true } ],
		} );
	}

	const errorText =
		action.payload && action.payload.slug
			? translate( 'Could not load tag, try refreshing the page' )
			: translate( 'Could not load your followed tags, try refreshing the page' );

	// see: https://github.com/Automattic/wp-calypso/pull/11627/files#r104468481
	if ( process.env.NODE_ENV === 'development' ) {
		console.error( errorText, error ); // eslint-disable-line no-console
	}

	return [ errorNotice( errorText ), receiveTags( { payload: [] } ) ];
}

registerHandlers( 'state/data-layer/wpcom/read/tags/index.js', {
	[ READER_TAGS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestTags,
			onSuccess: receiveTagsSuccess,
			onError: receiveTagsError,
			fromApi,
		} ),
	],
} );
