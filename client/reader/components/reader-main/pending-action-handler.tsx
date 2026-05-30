import { followReadTagMutation, likeSiteCommentMutation } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { usePostLikeActions } from 'calypso/reader/data/post/likes';
import { useDispatch, useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { follow } from 'calypso/state/reader/follows/actions';
import { clearLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import { getPersistedLastActionPriorToLogin } from 'calypso/state/reader-ui/selectors';

export const ReaderPendingActionHandler = () => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const pendingAction = useSelector( getPersistedLastActionPriorToLogin );
	const { mutate: followTag } = useMutation( followReadTagMutation( queryClient ) );
	const { mutate: likeComment } = useMutation( likeSiteCommentMutation() );
	const { likePost, unlikePost } = usePostLikeActions();

	useEffect( () => {
		if ( ! isLoggedIn || ! pendingAction ) {
			return;
		}

		// The timeout is a naieve attempt to try and combat race conditions. Initial requests from
		// the app loading could come back slower than what is dispatched here, causing a stale
		// state in the UI. However, there doesn't seem to be a good indicator for when all of these
		// potential items may already be loaded or some circumstances where they wouldn't be which
		// makes it difficult to evaluate this timing differently.
		setTimeout( () => {
			switch ( pendingAction.type ) {
				case 'like':
					likePost( pendingAction.siteId, pendingAction.postId );
					break;
				case 'unlike':
					unlikePost( pendingAction.siteId, pendingAction.postId );
					break;
				case 'comment-like':
					if ( ! pendingAction.commentId ) {
						break;
					}
					likeComment( {
						siteId: pendingAction.siteId,
						postId: pendingAction.postId,
						commentId: pendingAction.commentId,
					} );
					break;
				case 'follow-site':
					dispatch( follow( pendingAction.siteUrl, pendingAction.followData, null ) );
					break;
				case 'follow-tag':
					followTag( pendingAction.tag, {
						onError: () => {
							dispatch(
								errorNotice(
									translate( 'Could not follow tag: %(tag)s', { args: { tag: pendingAction.tag } } )
								)
							);
						},
					} );
					break;
			}
		}, 2000 );

		dispatch( clearLastActionRequiresLogin() );
	}, [ isLoggedIn, pendingAction, dispatch, followTag, likePost, unlikePost, likeComment ] );

	return null;
};
