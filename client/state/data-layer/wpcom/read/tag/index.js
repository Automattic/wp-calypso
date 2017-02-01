/**
 * Internal dependencies
 */
import { READER_FETCH_TAG_REQUEST } from 'state/action-types';
import { receiveTag, } from 'state/reader/tags/items/actions';
import wpcom from 'lib/wp';

export function handleTagRequest( store, action, next ) {
	next( action );
	wpcom.req.get( `/read/tags/${ action.payload.slug }`, { apiVersion: '1.2' } )
		.then(
			payload => store.dispatch( receiveTag( { payload, error: false } ) ),
			error => store.dispatch( receiveTag( { payload: error, error: true, } ) )
		);
}

export default {
	[ READER_FETCH_TAG_REQUEST ]: [ handleTagRequest ]
};

