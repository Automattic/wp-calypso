/** @format */

/**
 * External dependencies
 */
import { find, random } from 'lodash';
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

const streamToPathMatchers = [
	// ordering here is by how often we expect each stream type to be used
	// search is linear, so putting common things near the front can be helpful
	// Each object is a composed of:
	//   match: a regexp that matches against a stream ID
	//   path: a function that given the action, returns The API path to hit
	//   query: a function that given the action, returns the query to use.
	{
		match: /^following$/,
		path: () => '/read/following',
	},
	{
		match: /^search:/,
		path: () => '/read/search',
		query: ( { query, streamId } ) => {
			return { ...query, q: streamIdSuffix( streamId ) };
		},
	},
	{
		match: /^feed:/,
		path: ( { streamId } ) => `/read/feed/${ streamIdSuffix( streamId ) }/posts`,
	},
	{
		match: /^site:/,
		path: ( { streamId } ) => `/read/sites/${ streamIdSuffix( streamId ) }/posts`,
	},
	{
		match: /^conversations$/,
		path: () => '/read/conversations',
	},
	{
		match: /^featured:/,
		path: ( { streamId } ) => `/read/sites/${ streamIdSuffix( streamId ) }/featured`,
	},
	{
		match: /^a8c$/,
		path: () => '/read/a8c',
	},
	{
		match: /^a8c_conversations$/,
		path: () => '/read/conversations',
		query: () => ( { index: 'a8c' } ),
	},
	{
		match: /^likes$/,
		path: () => '/read/liked',
	},
	{
		match: /^recommendations_posts$/,
		path: () => '/read/recommendations/posts',
		query: ( { query } ) => {
			return {
				...query,
				seed: getSeedForQuery(),
				algorithm: 'read:recommendations:posts/es/1',
			};
		},
	},
	{
		match: /^custom_recs/,
		path: () => '/read/recommendations/posts',
		query: ( { query } ) => {
			return Object.assign( {}, query, {
				seed: getSeedForQuery(),
				algorithm: 'read:recommendations:posts/es/7',
			} );
		},
	},
	{
		match: /^tag:/,
		path: () => '/read/tags/:tag/posts',
	},
	{
		match: /^list:/,
		path: () => '/read/list/:owner/:slug/posts',
	},
	{
		match: /^featured:/,
		path: ( { site } ) => `/read/sites/${ site }/featured`,
	},
];

/**
 * Find the API descriptor for a stream ID
 * @param  {String} streamId A stream ID
 * @return {Object}          The API descriptor for the given stream. `null` if nothing matches.
 */
function apiForStream( streamId ) {
	return find( streamToPathMatchers, matcher => matcher.match.test( streamId ) );
}

/**
 * Request a page for the given stream
 * @param  {object}   action   Action being handled
 * @returns {object} http action for data-layer to dispatch
 */
export function requestPage( action ) {
	const { payload: { streamId } } = action;
	const api = apiForStream( streamId );

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

export function handlePage( action, data ) {
	const { streamId, query } = action.payload;
	return receivePage( { streamId, query, data } );
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
