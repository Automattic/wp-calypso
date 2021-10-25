import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import CommentLikeButtonContainer from './comment-likes';

import './comment-actions.scss';

const noop = () => {};

const CommentActions = ( {
	post,
	comment: { isPlaceholder },
	translate,
	activeEditCommentId,
	activeReplyCommentId,
	commentId,
	handleReply,
	onReplyCancel,
	editCommentCancel,
	showReadMore,
	onReadMore,
} ) => {
	const showReplyButton = post && post.discussion && post.discussion.comments_open === true;
	const showCancelReplyButton = activeReplyCommentId === commentId;
	const showCancelEditButton = activeEditCommentId === commentId;

	// Only render actions for non placeholders
	if ( isPlaceholder ) {
		return null;
	}

	return (
		<div className="comments__comment-actions">
			{ showReadMore && (
				<Button className="comments__comment-actions-read-more" onClick={ onReadMore }>
					<Gridicon
						icon="chevron-down"
						size={ 18 }
						className="comments__comment-actions-read-more-icon"
					/>
					{ translate( 'Read More' ) }
				</Button>
			) }
			{ showReplyButton && (
				<Button className="comments__comment-actions-reply" onClick={ handleReply }>
					<Gridicon icon="reply" size={ 18 } />
					<span className="comments__comment-actions-reply-label">{ translate( 'Reply' ) }</span>
				</Button>
			) }
			{ showCancelReplyButton && (
				<Button className="comments__comment-actions-cancel-reply" onClick={ onReplyCancel }>
					{ translate( 'Cancel reply' ) }
				</Button>
			) }
			{ showCancelEditButton && (
				<Button className="comments__comment-actions-cancel-reply" onClick={ editCommentCancel }>
					{ translate( 'Cancel' ) }
				</Button>
			) }
			<CommentLikeButtonContainer
				className="comments__comment-actions-like"
				tagName={ Button }
				siteId={ post.site_ID }
				postId={ post.ID }
				commentId={ commentId }
			/>
		</div>
	);
};

CommentActions.defaultProps = {
	onReadMore: noop,
};

export default localize( CommentActions );
