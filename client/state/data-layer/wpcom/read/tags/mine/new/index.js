/**
 * Internal dependencies
 */
import { READER_UNFOLLOW_TAG_REQUEST } from 'state/action-types';
import { receiveFollowTag, } from 'client/state/reader/tags/actions';
import wpcom from 'lib/wp';

export function handleUnfollowTagRequest( store, action, next ) {
	wpcom.req.post( `/read/tags/${ action.payload.slug }/mine/new`, { apiVersion: '1.2' } )
		.then(
			payload => store.dispatch( receiveFollowTag( { payload } ) ),
			error => store.dispatch( receiveFollowTag( { payload: error, error: true } ) ),
		);
	next( action );
}

export default {
	[ READER_UNFOLLOW_TAG_REQUEST ]: [ handleUnfollowTagRequest ]
};

