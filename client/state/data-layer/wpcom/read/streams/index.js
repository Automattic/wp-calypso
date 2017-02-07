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

function streamIdSuffix( streamId ) {
	return streamId.substring( streamId.indexOf( ':' ) + 1 );
}

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

function apiForStream( streamId ) {
	return find(
		streamToPathMatchers,
		( matcher ) => matcher.match.test( streamId )
	);
}

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
		apiVersion = 'v1.2',
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
	} ) );

	next( action );
}

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
