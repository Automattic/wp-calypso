/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_TAGS_REQUEST,
} from 'state/action-types';
import {
	receiveTags,
} from 'state/reader/tags/items/actions';

import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { mergeHandlers } from 'state/data-layer/utils';
import { fromApi } from 'state/data-layer/wpcom/read/tags/utils';
import { errorNotice } from 'state/notices/actions';
import followTagHandler from './mine/new';
import unFollowTagHandler from './mine/delete';

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
	// if from the read/tags api, then we should add isFollowing=true to the tag
	if ( apiResponse.tags ) {
		tags = map( tags, tag => ( { ...tag, isFollowing: true } ) );
	}

	store.dispatch( receiveTags( {
		payload: tags,
		resetFollowingData: !! apiResponse.tags,
		error: false,
	} ) );
}

export function receiveTagsError( store, action, next, error ) {
	store.dispatch( errorNotice( 'Could not fetch the tag' ) );
	if ( process.env.NODE_ENV === 'development' ) {
		throw new Error( error );
	}
}

const getFollowedTagsHandler = {
	[ READER_TAGS_REQUEST ]: [ dispatchRequest( requestTags, receiveTagsSuccess, receiveTagsSuccess ) ],
};

export default mergeHandlers(
	getFollowedTagsHandler,
	followTagHandler,
	unFollowTagHandler,
);
