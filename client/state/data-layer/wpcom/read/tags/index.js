/**
 * Internal dependencies
 */
import { READER_FETCH_TAGS_REQUEST } from 'state/action-types';
import { receiveTags, } from 'client/state/reader/tags/actions';
import wpcom from 'lib/wp';

export function handleTagsRequest( store, action, next ) {
	wpcom.req.get( '/read/tags', { apiVersion: '1.2' } )
		.then(
			payload => store.dispatch( receiveTags( { payload } ) ),
			error => store.dispatch( receiveTags( { payload: error, error: true } ) )
		);
	next( action );
}

export default {
	[ READER_FETCH_TAGS_REQUEST ]: [ handleTagsRequest ]
};

