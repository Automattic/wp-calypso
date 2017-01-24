/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import warn from 'lib/warn';
import {
	READER_STREAMS_PAGE_REQUEST,
	READER_STREAMS_PAGE_RECEIVE
} from 'state/action-types';

function apiPathForStream( streamId ) {
	if ( streamId === 'following' ) {
		return '/read/following';
	}
	return null;
}

export function interceptStreamPageRequest( store, action, next ) {
	const { streamId } = action;

	const apiPath = apiPathForStream( streamId );

	if ( apiPath === null ) {
		warn( `Unable to determine api path for ${ streamId }` );
		next( action );
		return;
	}

	const request = wp.req.get(
		apiPath,
		{ apiVersion: '1.2' },
		action.query
	).then( response => {
		store.dispatch( {
			...action,
			type: READER_STREAMS_PAGE_RECEIVE,
			page: response.data
		} );
	} );

	next( action );

	return request;
}

export default {
	[ READER_STREAMS_PAGE_REQUEST ]: [ interceptStreamPageRequest ]
};
