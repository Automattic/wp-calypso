/**
 * Internal dependencies
 */
import { READER_FETCH_TAG_REQUEST } from 'state/action-types';
import { receiveTag, } from 'client/state/reader/tags/actions';
import wpcom from 'lib/wp';

export function handleTagRequest( store, action, next ) {
	wpcom.req.get( `/read/tags/${ action.payload.slug }`, { apiVersion: '1.2' } )
		.then(
			payload => store.dispatch( receiveTag( { payload } ) ),
			error => store.dispatch( receiveTag( { payload: error, error: true, } ) )
		);
	next( action );
}

export default {
	[ READER_FETCH_TAG_REQUEST ]: [ handleTagRequest ]
};

