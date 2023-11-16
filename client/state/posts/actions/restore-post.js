import { translate } from 'i18n-calypso';
import { truncate } from 'lodash';
import wpcom from 'calypso/lib/wp';
import {
	POST_RESTORE_FAILURE,
	POST_RESTORE_SUCCESS,
	POST_RESTORE,
} from 'calypso/state/action-types';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { receivePost } from 'calypso/state/posts/actions/receive-post';
import { getSitePost } from 'calypso/state/posts/selectors';

import 'calypso/state/posts/init';

/**
 * Returns an action thunk which, when dispatched, triggers a network request
 * to restore the specified post.
 * @param  {number}   siteId Site ID
 * @param  {number}   postId Post ID
 * @param  {boolean}  silent Whether to stop related notices from appearing
 * @returns {Function}        Action thunk
 */
export function restorePost( siteId, postId, silent = false ) {
	return ( dispatch, getState ) => {
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
				if ( ! silent ) {
					dispatch( successNotice( translate( 'Post successfully restored' ) ) );
				}
			},
			( error ) => {
				dispatch( {
					type: POST_RESTORE_FAILURE,
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
					message = translate( 'An error occurred while restoring "%s"', {
						args: [ truncate( post.title, { length: 24 } ) ],
					} );
				} else {
					message = translate( 'An error occurred while restoring the post' );
				}

				dispatch( errorNotice( message ) );
			}
		);

		return restoreResult;
	};
}
