/** @format */

/**
 * External dependencies
 */
import { random } from 'lodash';
import { translate } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import warn from 'lib/warn';
import { READER_STREAMS_PAGE_REQUEST } from 'state/action-types';
import { receivePage } from 'state/reader/streams/actions';
import { errorNotice } from 'state/notices/actions';

/**
 * Pull the suffix off of a stream ID
 *
 * A stream id is a : delimited string, with the form
 * {prefix}:{suffix}
 *
 * Prefix cannot contain a colon, while the suffix may.
 *
 * A colon is not required.
 *
 * Valid IDs look like
 * `following`
 * `site:1234`
 * `search:a:value` ( prefix is `search`, suffix is `a:value` )
 *
 * @param  {String} streamId The stream ID to break apart
 * @return {String}          The stream ID suffix
 */
function streamIdSuffix( streamId ) {
	return streamId.substring( streamId.indexOf( ':' ) + 1 );
}

function getSeedForQuery() {
	return random( 0, 10000 );
}

// Each object is a composed of:
//   path: a function that given the action, returns The API path to hit
//   query: a function that given the action, returns the query to use.
const streamApis = {
	following: {
		path: () => '/read/following',
	},
	search: {
		path: () => '/read/search',
		query: ( { query, streamId } ) => {
			return { ...query, q: streamIdSuffix( streamId ) };
		},
	},
	feed: {
		path: ( { streamId } ) => `/read/feed/${ streamIdSuffix( streamId ) }/posts`,
	},
	site: {
		path: ( { streamId } ) => `/read/sites/${ streamIdSuffix( streamId ) }/posts`,
	},
	conversations: {
		path: () => '/read/conversations',
	},
	featured: {
		path: ( { streamId } ) => `/read/sites/${ streamIdSuffix( streamId ) }/featured`,
	},
	a8c: {
		match: /^a8c$/,
		path: () => '/read/a8c',
	},
	a8c_conversations: {
		match: /^a8c_conversations$/,
		path: () => '/read/conversations',
		query: () => ( { index: 'a8c' } ),
	},
	likes: {
		path: () => '/read/liked',
	},
	recommendations_posts: {
		path: () => '/read/recommendations/posts',
		query: ( { query } ) => {
			return {
				...query,
				seed: getSeedForQuery(),
				algorithm: 'read:recommendations:posts/es/1',
			};
		},
	},
	custom_recs_posts_with_images: {
		path: () => '/read/recommendations/posts',
		query: ( { query } ) => {
			return Object.assign( {}, query, {
				seed: getSeedForQuery(),
				algorithm: 'read:recommendations:posts/es/7',
			} );
		},
	},
	tag: {
		path: () => '/read/tags/:tag/posts',
	},
	list: {
		path: () => '/read/list/:owner/:slug/posts',
	},
};

/**
 * Request a page for the given stream
 * @param  {object}   action   Action being handled
 * @returns {object} http action for data-layer to dispatch
 */
export function requestPage( action ) {
	const { payload: { streamId, streamType } } = action;
	const api = streamApis[ streamType ];

	if ( ! api ) {
		warn( `Unable to determine api path for ${ streamId }` );
		return;
	}

	const { apiVersion = '1.2', path, query } = api;

	return http( {
		method: 'GET',
		path: path( action.payload ),
		apiVersion,
		query: query ? query( action.payload ) : {},
		onSuccess: action,
		onFailure: action,
	} );
}

/**
 * Transform the response from the API
 * @param  {Object} data The data from the API request
 * @return {Object}      The transformed data
 */
export function fromApi( data ) {
	//TODO schema validation?
	return ( data && data.posts ) || [];
}

export function handlePage( action, posts ) {
	const { streamId, query } = action.payload;
	return receivePage( { streamId, query, posts } );
}

export function handleError() {
	return errorNotice( translate( 'Could not fetch the next page of posts' ) );
}

export default {
	[ READER_STREAMS_PAGE_REQUEST ]: [
		dispatchRequestEx( {
			fetch: requestPage,
			onSuccess: handlePage,
			onError: handleError,
			fromApi,
		} ),
	],
};
