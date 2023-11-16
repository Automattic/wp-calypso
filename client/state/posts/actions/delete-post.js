import { translate } from 'i18n-calypso';
import { truncate } from 'lodash';
import wpcom from 'calypso/lib/wp';
import { POST_DELETE_FAILURE, POST_DELETE_SUCCESS, POST_DELETE } from 'calypso/state/action-types';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { getSitePost } from 'calypso/state/posts/selectors';

import 'calypso/state/posts/init';

/**
 * Returns an action thunk which, when dispatched, triggers a network request
 * to delete the specified post. The post should already have a status of trash
 * when dispatching this action, else you should use `trashPost`.
 * @param  {number}   siteId Site ID
 * @param  {number}   postId Post ID
 * @param  {boolean}  silent Whether to stop related notices from appearing
 * @returns {Function}        Action thunk
 */
export function deletePost( siteId, postId, silent = false ) {
	return ( dispatch, getState ) => {
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

				if ( silent ) {
					return;
				}

				dispatch( successNotice( translate( 'Post successfully deleted' ) ) );
			},
			( error ) => {
				dispatch( {
					type: POST_DELETE_FAILURE,
					siteId,
					postId,
					error,
				} );

				if ( silent ) {
					return;
				}

				const post = getSitePost( getState(), siteId, postId );

				let message;
				if ( post ) {
					message = translate( 'An error occurred while deleting "%s"', {
						args: [ truncate( post.title, { length: 24 } ) ],
					} );
				} else {
					message = translate( 'An error occurred while deleting the post' );
				}

				dispatch( errorNotice( message ) );
			}
		);

		return deleteResult;
	};
}
