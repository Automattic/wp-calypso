/**
 * External dependencies
 */
import { find } from 'lodash';
/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import warn from 'lib/warn';
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

function apiPathForStream( streamId ) {
	return find( streamToPathMatchers, ( matcher ) => matcher[ 0 ].test( streamId ) );
}

export function interceptStreamPageRequest( store, action, next ) {
	const { streamId } = action;
	const matcher = apiPathForStream( streamId );

	if ( ! matcher ) {
		warn( `Unable to determine api path for ${ streamId }` );
		next( action );
		return;
	}

	const [ _, apiVersion, path ] = matcher; //eslint-disable-line no-unused-vars

	const request = wp.req.get(
		path,
		{ apiVersion },
		action.query
	).then( ( response ) => {
		store.dispatch( {
			...action,
			type: READER_STREAMS_PAGE_RECEIVE,
			payload: response
		} );
	} );

	next( action );
	return request;
}

export default {
	[ READER_STREAMS_PAGE_REQUEST ]: [ interceptStreamPageRequest ]
};
