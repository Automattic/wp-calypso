/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	POST_RESTORE_FAILURE,
	POST_RESTORE_SUCCESS,
	POST_RESTORE,
} from 'calypso/state/action-types';
import { receivePost } from 'calypso/state/posts/actions/receive-post';

import 'calypso/state/posts/init';

/**
 * Returns an action thunk which, when dispatched, triggers a network request
 * to restore the specified post.
 *
 * @param  {number}   siteId Site ID
 * @param  {number}   postId Post ID
 * @returns {Function}        Action thunk
 */
export function restorePost( siteId, postId ) {
	return ( dispatch ) => {
		dispatch( {
			type: POST_RESTORE,
			siteId,
			postId,
		} );

		const restoreResult = wpcom.site( siteId ).post( postId ).restore();

		restoreResult.then(
			( restoredPost ) => {
				dispatch( {
					type: POST_RESTORE_SUCCESS,
					siteId,
					postId,
				} );
				dispatch( receivePost( restoredPost ) );
			},
			( error ) => {
				dispatch( {
					type: POST_RESTORE_FAILURE,
					siteId,
					postId,
					error,
				} );
			}
		);

		return restoreResult;
	};
}
