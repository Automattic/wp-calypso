import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { likeComment } from 'calypso/state/comments/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { like } from 'calypso/state/posts/likes/actions';
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
		}

		dispatch( clearLastActionRequiresLogin() );
	}, [ isLoggedIn, pendingAction, dispatch ] );

	return null;
};
