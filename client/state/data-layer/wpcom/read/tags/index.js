/**
 * External dependencies
 */
import { map } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	READER_TAGS_REQUEST,
} from 'state/action-types';
import { receiveTags, } from 'state/reader/tags/items/actions';
import requestFollowHandler from 'state/data-layer/wpcom/read/tags/mine/new';
import requestUnfollowHandler from 'state/data-layer/wpcom/read/tags/mine/delete';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { mergeHandlers } from 'state/data-layer/utils';
import { fromApi } from 'state/data-layer/wpcom/read/tags/utils';
import { errorNotice } from 'state/notices/actions';

export function requestTags( store, action, next ) {
	const path = action.payload && action.payload.slug
		? `/read/tags/${ action.payload.slug }`
		: '/read/tags';

	store.dispatch( http( {
		path,
		method: 'GET',
		apiVersion: '1.2',
		onSuccess: action,
		onFailure: action,
	} ) );

	next( action );
}

export function receiveTagsSuccess( store, action, next, apiResponse ) {
	let tags = fromApi( apiResponse );
	if ( ! apiResponse || ! apiResponse.tag && ! apiResponse.tags ) {
		receiveTagsError( store, action, next );
		return;
	}

	// if from the read following tags api, then we should add isFollowing=true to all of the tags
	if ( apiResponse.tags ) {
		tags = map( tags, tag => ( { ...tag, isFollowing: true } ) );
	}

	store.dispatch( receiveTags( {
		payload: tags,
		resetFollowingData: !! apiResponse.tags
	} ) );
}

export function receiveTagsError( store, action, next, error ) {
	const errorText = action.payload && action.payload.slug
		? translate( 'Could not load tag, try refreshing the page' )
		: translate( 'Could not load your followed tags, try refreshing the page' );

	store.dispatch( errorNotice( errorText ) );
	// imperfect solution of lying to Calypso and saying the tag doesn't exist so that the query component stops asking for it
	// see: https://github.com/Automattic/wp-calypso/pull/11627/files#r104468481
	store.dispatch( receiveTags( { payload: [] } ) );
	if ( process.env.NODE_ENV === 'development' ) {
		console.error( errorText, error ); // eslint-disable-line no-console
	}
}

const readTagsHandler = {
	[ READER_TAGS_REQUEST ]: [ dispatchRequest( requestTags, receiveTagsSuccess, receiveTagsSuccess ) ],
};

export default mergeHandlers(
	readTagsHandler,
	requestFollowHandler,
	requestUnfollowHandler,
);

