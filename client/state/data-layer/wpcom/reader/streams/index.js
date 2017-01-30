/**
 * External dependencies
 */
import { find } from 'lodash';
/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import warn from 'lib/warn';
import { requestInflight, trackPromise } from 'lib/inflight';
import {
	READER_STREAMS_PAGE_REQUEST,
	READER_STREAMS_PAGE_RECEIVE
} from 'state/action-types';

const streamToPathMatchers = [
	// [ regex, version, path ]
	// ordering here is by how often we expect each stream type to be used
	// search is linear, so putting common things near the front can be helpful
	[ /^following$/, '1.2', '/read/following' ],
	[ /^search:/, '1.2', '/read/search' ],
	[ /^feed:/, '1.2', '/read/feed/:feed/posts' ],
	[ /^site:/, '1.2', '/read/sites/:site/posts' ],
	[ /^featured:/, '1.2', '/read/sites/:site/featured' ],
	[ /^a8c$/, '1.2', '/read/a8c' ],
];

function apiForStream( streamId ) {
	return find( streamToPathMatchers, ( matcher ) => matcher[ 0 ].test( streamId ) );
}

function keyForRequest( action ) {
	const { streamId, query } = action;
	const actionString = Object.keys( query )
		.sort() // sort the keys to make the string deterministic. key ordering is not.
		.reduce( ( memo, key ) => memo + `&${ key }=${ query[ key ] }`, '' );
	return `reader-streams-${ streamId }-${ actionString }`;
}

export function interceptStreamPageRequest( store, action, next ) {
	const { streamId } = action;
	const api = apiForStream( streamId );

	if ( ! api ) {
		warn( `Unable to determine api path for ${ streamId }` );
		next( action );
		return;
	}

	// is this request already inflight?
	const requestKey = keyForRequest( action );
	if ( requestInflight( requestKey ) ) {
		next( action );
		return;
	}

	const [ _, apiVersion, path ] = api; //eslint-disable-line no-unused-vars

	function transformResponse( response ) {
		return response;
	}

	function dispatchReceive( response ) {
		store.dispatch( {
			...action,
			type: READER_STREAMS_PAGE_RECEIVE,
			payload: response,
		} );
	}

	function dispatchError( err ) {
		store.dispatch( {
			...action,
			type: READER_STREAMS_PAGE_RECEIVE,
			payload: err,
			error: true,
		} );
	}

	const request = wp.req.get(
		path,
		{ apiVersion },
		action.query
	);

	const tracker = trackPromise( requestKey, request );

	next( action );

	return tracker
		.then( transformResponse )
		.then( dispatchReceive )
		.catch( dispatchError );
}

export default {
	[ READER_STREAMS_PAGE_REQUEST ]: [ interceptStreamPageRequest ]
};
