/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { POST_SAVE_FAILURE, POST_SAVE } from 'state/action-types';
import { receivePost } from 'state/posts/actions/receive-post';
import { savePostSuccess } from 'state/posts/actions/save-post-success';

import 'state/posts/init';

/**
 * Returns an action thunk which, when dispatched, triggers a network request
 * to trash the specified post.
 *
 * @param  {number}   siteId Site ID
 * @param  {number}   postId Post ID
 * @returns {Function}        Action thunk
 */
export function trashPost( siteId, postId ) {
	return ( dispatch ) => {
		// Trashing post is almost equivalent to saving the post with status field set to `trash`
		// and the action behaves like it was doing exactly that -- it dispatches the `POST_SAVE_*`
		// actions with the right properties.
		//
		// But what we really do is to call the `wpcom.site().post().delete()` method, i.e., sending
		// a `POST /sites/:site/posts/:post/delete` request. The difference is that an explicit delete
		// will set a `_wp_trash_meta_status` meta property on the post and a later `restore` call
		// can restore the original post status, i.e., `publish`. Without this, the post will be always
		// recovered as `draft`.
		const post = { status: 'trash' };

		dispatch( {
			type: POST_SAVE,
			siteId,
			postId,
			post,
		} );

		const trashResult = wpcom.site( siteId ).post( postId ).delete();

		trashResult.then(
			( savedPost ) => {
				dispatch( savePostSuccess( siteId, postId, savedPost, post ) );
				dispatch( receivePost( savedPost ) );
			},
			( error ) => {
				dispatch( {
					type: POST_SAVE_FAILURE,
					siteId,
					postId,
					error,
				} );
			}
		);

		return trashResult;
	};
}
