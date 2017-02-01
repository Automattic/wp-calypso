/**
 * Internal dependencies
 */
import { READER_UNFOLLOW_TAG_REQUEST } from 'state/action-types';
import { receiveUnfollowTag, } from 'state/reader/tags/items/actions';

import wpcom from 'lib/wp';

export function handleUnfollowTagRequest( store, action, next ) {
	wpcom.req.post( `/read/tags/${ action.payload.slug }/mine/delete` )
		.then(
			payload => store.dispatch( receiveUnfollowTag( { payload, error: false, } ) ),
			error => store.dispatch( receiveUnfollowTag( { payload: error, error: true } ) ),
		);

	next( action );
}

export default {
	[ READER_UNFOLLOW_TAG_REQUEST ]: [ handleUnfollowTagRequest ]
};

