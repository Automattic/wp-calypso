import config from '@automattic/calypso-config';
import PostComments from 'calypso/blocks/comments';
import { COMMENTS_FILTER_ALL } from 'calypso/blocks/comments/comments-filters';
import { isCommentsOpen } from 'calypso/reader/post/capabilities';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';

const PostCardComments = ( { post, handleClick, fixedHeaderHeight, streamKey } ) => {
	// If the user is unable to comment and the comment count is zero, there is no reason to fetch
	// and show comments.
	const shouldHideComments = ! isCommentsOpen( post ) && post.discussion?.comment_count === 0;

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

	if ( shouldHideComments ) {
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
