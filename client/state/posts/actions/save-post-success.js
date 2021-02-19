/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { POST_SAVE_SUCCESS } from 'calypso/state/action-types';
import { restorePost } from 'calypso/state/posts/actions';
import { successNotice, removeNotice } from 'calypso/state/notices/actions';

import 'calypso/state/posts/init';

/**
 * Returns an action object to be used in signalling that a post has been saved
 *
 * @param  {number}   siteId     Site ID
 * @param  {number}   postId     Post ID
 * @param  {object}   savedPost  Updated post
 * @param  {object}   post       Post attributes
 * @param  {boolean}  silent     Whether to stop related notices from appearing
 * @returns {object}              Action thunk
 */
export function savePostSuccess( siteId, postId = null, savedPost, post, silent = false ) {
	return ( dispatch ) => {
		dispatch( {
			type: POST_SAVE_SUCCESS,
			siteId,
			postId,
			savedPost,
			post,
		} );

		if ( silent ) {
			return;
		}

		switch ( post.status ) {
			case 'trash': {
				const noticeId = 'trash_' + savedPost.global_ID;
				dispatch(
					successNotice( translate( 'Post successfully moved to trash.' ), {
						id: noticeId,
						button: translate( 'Undo' ),
						onClick: () => {
							dispatch( removeNotice( noticeId ) );
							dispatch( restorePost( savedPost.site_ID, savedPost.ID ) );
						},
					} )
				);
				break;
			}

			case 'publish': {
				dispatch( successNotice( translate( 'Post successfully published' ) ) );
				break;
			}
		}
	};
}
