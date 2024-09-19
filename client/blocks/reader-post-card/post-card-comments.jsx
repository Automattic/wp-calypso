import config from '@automattic/calypso-config';
import { useEffect } from 'react';
import PostComments from 'calypso/blocks/comments';
import { COMMENTS_FILTER_ALL } from 'calypso/blocks/comments/comments-filters';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import { useDispatch, useSelector } from 'calypso/state';
import { requestPostComments } from 'calypso/state/comments/actions';
import { commentsFetchingStatus } from 'calypso/state/comments/selectors';

const PostCardComments = ( { post, handleClick, fixedHeaderHeight, streamKey } ) => {
	const dispatch = useDispatch();
	const fetchStatus = useSelector( ( state ) =>
		commentsFetchingStatus( state, post.site_ID, post.ID )
	);
	const hasFetchedComments = fetchStatus.hasReceivedBefore || fetchStatus.hasReceivedAfter;

	// If the user is unable to comment and the comment count is zero, there is no reason to fetch
	// and show comments.
	const shouldHideComments =
		! post.discussion?.comments_open && post.discussion?.comment_count === 0;

	useEffect( () => {
		// Request comments if they have not been set in state.
		if ( ! hasFetchedComments && ! shouldHideComments ) {
			dispatch( requestPostComments( { siteId: post.site_ID, postId: post.ID } ) );
		}
	}, [ post, dispatch, hasFetchedComments, shouldHideComments ] );

	const onOpenPostPageAtCommentsClick = () => {
		recordAction( 'click_inline_comments_view_on_post' );
		recordGaEvent( 'Clicked Inline Comments View On Post' );
		recordTrackForPost( 'calypso_reader_inline_comments_view_on_post_clicked', post );

		handleClick &&
			handleClick( {
				post,
				comments: true,
			} );
	};

	if ( shouldHideComments || ! hasFetchedComments ) {
		return null;
	}

	return (
		<PostComments
			commentCount={ post.discussion?.comment_count }
			expandableView
			commentsFilterDisplay={ COMMENTS_FILTER_ALL }
			post={ post }
			shouldPollForNewComments={ config.isEnabled( 'reader/comment-polling' ) }
			shouldHighlightNew
			showCommentCount={ false }
			showConversationFollowButton={ false }
			showNestingReplyArrow
			initialSize={ 5 }
			maxDepth={ 1 }
			openPostPageAtComments={ onOpenPostPageAtCommentsClick }
			fixedHeaderHeight={ fixedHeaderHeight }
			streamKey={ streamKey }
		/>
	);
};

export default PostCardComments;
