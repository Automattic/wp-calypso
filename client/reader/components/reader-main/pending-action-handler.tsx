import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { likeComment } from 'calypso/state/comments/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { like } from 'calypso/state/posts/likes/actions';
import { follow } from 'calypso/state/reader/follows/actions';
import { requestFollowTag } from 'calypso/state/reader/tags/items/actions';
import { clearLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import { getLastActionRequiresLogin } from 'calypso/state/reader-ui/selectors';

export const ReaderPendingActionHandler = () => {
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const pendingAction = useSelector( getLastActionRequiresLogin );

	useEffect( () => {
		if ( ! isLoggedIn || ! pendingAction ) {
			return;
		}

		switch ( pendingAction.type ) {
			case 'like':
				dispatch( like( pendingAction.siteId, pendingAction.postId ) );
				break;
			case 'comment-like':
				dispatch(
					likeComment( pendingAction.siteId, pendingAction.postId, pendingAction.commentId )
				);
				break;
			case 'follow-site':
				dispatch( follow( pendingAction.siteUrl, pendingAction.followData, null ) );
				break;
			case 'follow-tag':
				dispatch( requestFollowTag( pendingAction.tag ) );
				break;
		}

		dispatch( clearLastActionRequiresLogin() );
	}, [ isLoggedIn, pendingAction, dispatch ] );

	return null;
};
