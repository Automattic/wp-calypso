import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import ShareButton from 'calypso/blocks/reader-share';
import { shouldShowReblog } from 'calypso/blocks/reader-share/helper';
import { useSelector } from 'calypso/state';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import CommentLikeButtonContainer from './comment-likes';

import './comment-actions.scss';

const CommentActions = ( {
	post,
	comment,
	comment: { isPlaceholder },
	activeReplyCommentId,
	commentId,
	handleReply,
	onReplyCancel,
	showReadMore,
	onReadMore,
	onLikeToggle,
} ) => {
	const translate = useTranslate();
	const showReplyButton = post && post.discussion && post.discussion.comments_open === true;
	const showCancelReplyButton = activeReplyCommentId === commentId;
	const hasSites = !! useSelector( getPrimarySiteId );
	const showReblogButton = shouldShowReblog( post, hasSites );

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
			{ showReblogButton && (
				<ShareButton
					post={ post }
					comment={ comment }
					position="bottom"
					tagName="div"
					iconSize={ 18 }
					isReblogSelection
					showReblogLabel
				/>
			) }
			{ showCancelReplyButton && (
				<Button className="comments__comment-actions-cancel-reply" onClick={ onReplyCancel }>
					{ translate( 'Cancel reply' ) }
				</Button>
			) }
			<CommentLikeButtonContainer
				className="comments__comment-actions-like"
				tagName={ Button }
				siteId={ post.site_ID }
				postId={ post.ID }
				commentId={ commentId }
				onLikeToggle={ onLikeToggle }
			/>
		</div>
	);
};

export default CommentActions;
