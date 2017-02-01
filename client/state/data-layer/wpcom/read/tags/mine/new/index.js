/**
 * Internal dependencies
 */
import { READER_FOLLOW_TAG_REQUEST } from 'state/action-types';
import { receiveFollowTag, } from 'state/reader/tags/items/actions';
import wpcom from 'lib/wp';

export function handleFollowTagRequest( store, action, next ) {
	wpcom.req.post( `/read/tags/${ action.payload.slug }/mine/new` )
		.then(
			payload => store.dispatch( receiveFollowTag( { payload, error: false } ) ),
			error => store.dispatch( receiveFollowTag( { payload: error, error: true } ) ),
		);
	next( action );
}

export default {
	[ READER_FOLLOW_TAG_REQUEST ]: [ handleFollowTagRequest ]
};

