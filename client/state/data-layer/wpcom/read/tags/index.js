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

/**
 * Normalize response from the api so whether we get back a single tag or a list of tags
 * we always pass forward a list
 * @param  {Tag|Tags} apiResponse api response from the tags endpoint
 * @return {Tags}             An object containing list of tags
 */
function fromApi( apiResponse ) {
	let tags;
	if ( apiResponse.tag )	 {
		tags = [ apiResponse.tag ];
	} else if ( apiResponse.tags ) {
		tags = map( apiResponse.tags, tag => ( { ...tag, is_following: true } ) );
	} else {
		if ( process.env.NODE_ENV === 'development' ) {
			throw new Error( 'bad api response for /read/tags' );
		}
		tags = [];
	}

	return { tags };
}

export function receiveTagsSuccess( store, action, next, apiResponse ) {
	store.dispatch( receiveTags( {
		payload: fromApi( apiResponse ),
		error: false
	} ) );
}

export function receiveTagsError( store, action, next, error ) {
	store.dispatch( receiveTags( {
		payload: error,
		error: true
	} ) );
}

export default {
	[ READER_TAGS_REQUEST ]: [ dispatchRequest( requestTags, receiveTagsSuccess, receiveTagsSuccess ) ],
};
