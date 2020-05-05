/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { POST_DELETE_FAILURE, POST_DELETE_SUCCESS, POST_DELETE } from 'state/action-types';

import 'state/posts/init';

/**
 * Returns an action thunk which, when dispatched, triggers a network request
 * to delete the specified post. The post should already have a status of trash
 * when dispatching this action, else you should use `trashPost`.
 *
 * @param  {number}   siteId Site ID
 * @param  {number}   postId Post ID
 * @returns {Function}        Action thunk
 */
export function deletePost( siteId, postId ) {
	return ( dispatch ) => {
		dispatch( {
			type: POST_DELETE,
			siteId,
			postId,
		} );

		const deleteResult = wpcom.site( siteId ).post( postId ).delete();

		deleteResult.then(
			() => {
				dispatch( {
					type: POST_DELETE_SUCCESS,
					siteId,
					postId,
				} );
			},
			( error ) => {
				dispatch( {
					type: POST_DELETE_FAILURE,
					siteId,
					postId,
					error,
				} );
			}
		);

		return deleteResult;
	};
}
