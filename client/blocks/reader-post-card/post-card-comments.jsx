import config from '@automattic/calypso-config';
import { useEffect } from 'react';
import PostComments from 'calypso/blocks/comments';
import { COMMENTS_FILTER_ALL } from 'calypso/blocks/comments/comments-filters';
import { useDispatch, useSelector } from 'calypso/state';
import { requestPostComments } from 'calypso/state/comments/actions';
import { commentsFetchingStatus } from 'calypso/state/comments/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

const PostCardComments = ( { post, onCommentClick } ) => {
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const fetchStatus = useSelector( ( state ) =>
		commentsFetchingStatus( state, post.site_ID, post.ID )
	);
	const hasFetchedComments = fetchStatus.hasReceivedBefore || fetchStatus.hasReceivedAfter;

	// If the user is unable to comment and the comment count is zero, there is no reason to fetch
	// and show comments.
	const shouldHideComments =
		( ! post.discussion?.comments_open || ! isLoggedIn ) && post.discussion?.comment_count === 0;

	useEffect( () => {
		// Request comments if they have not been set in state.
		if ( ! hasFetchedComments && ! shouldHideComments ) {
			dispatch( requestPostComments( { siteId: post.site_ID, postId: post.ID } ) );
		}
	}, [ post, dispatch, hasFetchedComments, shouldHideComments ] );

	if ( shouldHideComments ) {
		return null;
	}

	return (
		// Stop propagation on clicking of comment area, as the event will bubble to the
		// card's onClick and redirect the page.
		//  eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
		<div onClick={ ( ev ) => ev.stopPropagation() }>
			<PostComments
				commentCount={ post.discussion?.comment_count }
				expandableView={ true }
				commentsFilterDisplay={ COMMENTS_FILTER_ALL }
				post={ post }
				shouldPollForNewComments={ config.isEnabled( 'reader/comment-polling' ) }
				shouldHighlightNew={ true }
				showCommentCount={ false }
				showConversationFollowButton={ false }
				showNestingReplyArrow={ true }
				initialSize={ 5 }
				pageSize={ 15 }
				maxDepth={ 1 }
				// TODO - separate this callback so it doesnt send same stats as comment icon.
				openPostPageAtComments={ onCommentClick }
			/>
		</div>
	);
};

export default PostCardComments;
