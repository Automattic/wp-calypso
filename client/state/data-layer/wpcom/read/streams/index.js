/**
 * External dependencies
 */
import { find, identity, random } from 'lodash';
import { translate } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import warn from 'lib/warn';
import {
	isRequestInflight,
	markRequestInflight,
	completeRequest
} from 'lib/inflight';
import {
	READER_STREAMS_PAGE_REQUEST
} from 'state/action-types';
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

/**
 * A Higher Order Function that generates a function that replaces a named token with the stream suffix
 *
 * Usage:
 *   `replacePathTokenWithSuffix( 'name' )( '/a/path/:name', 'name:ben' )`
 * @param  {String} token The named token to replace
 * @return {Function}       A function that takes a path and an action with a `streamId` property
 */
function replacePathTokenWithSuffix( token ) {
	return ( path, { streamId } ) => {
		return path.replace( token, streamIdSuffix( streamId ) );
	};
}

function getSeedForQuery( ) {
	return random( 0, 10000 );
}

const streamToPathMatchers = [
	// ordering here is by how often we expect each stream type to be used
	// search is linear, so putting common things near the front can be helpful
	// Each object is a composed of:
	//   match: a regexp that matches against a stream ID
	//   path: The API path to hit
	//   pathAdvice: a function that takes the path and an action. Returns the path to use in the request.
	//   queryAdvice: a function that takes the query and an action. Returns the query to use.
	{
		match: /^following$/,
		path: '/read/following'
	},
	{
		match: /^search:/,
		path: '/read/search',
		queryAdvice: ( query, { streamId } ) => {
			query.q = streamIdSuffix( streamId );
			return query;
		}
	},
	{
		match: /^feed:/,
		path: '/read/feed/:feed/posts',
		pathAdvice: replacePathTokenWithSuffix( ':feed' ),
	},
	{
		match: /^site:/,
		path: '/read/sites/:site/posts',
		pathAdvice: replacePathTokenWithSuffix( ':site' )
	},
	{
		match: /^featured:/,
		path: '/read/sites/:site/featured',
		pathAdvice: replacePathTokenWithSuffix( ':site' )
	},
	{
		match: /^a8c$/,
		path: '/read/a8c'
	},
	{
		match: /^likes$/,
		path: '/read/liked'
	},
	{
		match: /^recommendations_posts$/,
		path: '/read/recommendations/posts',
		queryAdvice: ( query ) => {
			return Object.assign(
				{},
				query,
				{
					seed: getSeedForQuery(),
					algorithm: 'read:recommendations:posts/es/1'
				}
			);
		}
	},
	{
		match: /^custom_recs/,
		path: '/read/recommendations/posts',
		queryAdvice: ( query ) => {
			return Object.assign(
				{},
				query,
				{
					seed: getSeedForQuery(),
					algorithm: 'read:recommendations:posts/es/7'
				}
			);
		}
	},
	{
		match: /^tag:/,
		path: '/read/tags/:tag/posts'
	},
	{
		match: /^list:/,
		path: '/read/list/:owner/:slug/posts'
	},
	{
		match: /^featured:/,
		path: '/read/sites/:site/featured',
		pathAdvice: replacePathTokenWithSuffix( ':site' )
	}
];

/**
 * Find the API descriptor for a stream ID
 * @param  {String} streamId A stream ID
 * @return {Object}          The API descriptor for the given stream. `null` if nothing matches.
 */
function apiForStream( streamId ) {
	return find(
		streamToPathMatchers,
		( matcher ) => matcher.match.test( streamId )
	);
}

/**
 * Generate a unique key for the provided request. Used for deduping.
 * @param  {Object} action The action
 * @return {String}       	A key for the given action
 */
export function keyForRequest( action ) {
	const { streamId, query } = action;
	const actionString = !! query
		? Object.keys( query )
			.sort() // sort the keys to make the string deterministic. key ordering is not.
			.reduce( ( memo, key ) => memo + `&${ key }=${ query[ key ] }`, '' )
		: '';
	return `${ action.type }-${ streamId }-${ actionString }`;
}

/**
 * Request a page for the given stream
 * @param  {function}   dispatch Redux Dispatcher
 * @param  {object}   action   Action being handled
 * @param  {Function} next     Continuation of handlers
 */
export function requestPage( { dispatch }, action, next ) {
	const { streamId, query } = action;
	const api = apiForStream( streamId );

	if ( ! api ) {
		warn( `Unable to determine api path for ${ streamId }` );
		next( action );
		return;
	}

	const requestKey = keyForRequest( action );
	if ( isRequestInflight( requestKey ) ) {
		next( action );
		return;
	}

	const {
		apiVersion = '1.2',
		path,
		pathAdvice = identity,
		queryAdvice = identity
	} = api;

	const actualPath = pathAdvice( path, action );
	const actualQuery = queryAdvice( query, action );

	markRequestInflight( requestKey );

	dispatch( http( {
		method: 'GET',
		path: actualPath,
		apiVersion,
		query: actualQuery,
		onSuccess: action,
		onFailure: action,
	} ) );

	next( action );
}

/**
 * Transform the response from the API
 * @param  {Object} data The data from the API request
 * @return {Object}      The transformed data
 */
export function transformResponse( data ) {
	//TODO schema validation?
	return ( data && data.posts ) || [];
}

/**
 * Handle a page of posts
 * @param  {function}   dispatch store dispatcher
 * @param  {object}   action   action object that kicked off the request
 * @param  {Function} next     next part in the middleware chain
 * @param  {object}   data     response from API
 * @param  {array}   data.posts Array of posts
 */
export function handlePage( { dispatch }, action, next, data ) {
	completeRequest( keyForRequest( action ) );
	dispatch( receivePage( action.streamId, action.query, transformResponse( data ) ) );
}

export function handleError( { dispatch }, action ) {
	completeRequest( keyForRequest( action ) );
	dispatch( errorNotice( translate( 'Could not fetch the next page of results' ) ) );
}

export default {
	[ READER_STREAMS_PAGE_REQUEST ]: [ dispatchRequest( requestPage, handlePage, handleError ) ]
};
