import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, close, keyboardReturn } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import ShareButton from 'calypso/blocks/reader-share';
import { isCommentsOpen, isRebloggable } from 'calypso/reader/post/capabilities';
import { useSelector } from 'calypso/state';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { CommentLabelsContext } from './comment-labels-context';
import CommentLikeButtonContainer from './comment-likes';

import './comment-actions.scss';

const CommentActions = ( {
	post,
	comment,
	comment: { isPlaceholder },
	activeReplyCommentId,
	handleReply,
	onReplyCancel,
	showReadMore,
	onReadMore,
	onLikeToggle,
} ) => {
	const translate = useTranslate();
	const spellOutLabels = useContext( CommentLabelsContext );
	const commentId = comment.ID;
	const showReplyButton = isCommentsOpen( post );
	const showCancelReplyButton = activeReplyCommentId === commentId;
	// Spelled out, Cancel takes over Reply's button while the editor is open, so focus stays on it.
	const swapReplyForCancel = spellOutLabels && showReplyButton && showCancelReplyButton;
	const hasSites = !! useSelector( getPrimarySiteId );
	const showReblogButton = isRebloggable( post, hasSites );

	let replyIcon = <Gridicon icon="reply" size={ 18 } />;
	if ( swapReplyForCancel ) {
		replyIcon = (
			<Icon icon={ close } size={ 18 } className="comments__comment-actions-cancel-icon" />
		);
	} else if ( spellOutLabels ) {
		replyIcon = (
			<Icon icon={ keyboardReturn } size={ 18 } className="comments__comment-actions-reply-icon" />
		);
	}

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
				<Button
					className="comments__comment-actions-reply"
					aria-label={ swapReplyForCancel ? translate( 'Cancel reply' ) : undefined }
					onClick={ swapReplyForCancel ? onReplyCancel : handleReply }
				>
					{ replyIcon }
					<span className="comments__comment-actions-reply-label">
						{ swapReplyForCancel
							? translate( 'Cancel', { context: 'verb' } )
							: translate( 'Reply' ) }
					</span>
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
					showReblogLabel={ spellOutLabels }
				/>
			) }
			{ showCancelReplyButton && ! swapReplyForCancel && (
				<Button className="comments__comment-actions-cancel-reply" onClick={ onReplyCancel }>
					{ translate( 'Cancel reply' ) }
				</Button>
			) }
			<CommentLikeButtonContainer
				className="comments__comment-actions-like"
				tagName={ Button }
				siteId={ post.site_ID }
				postId={ post.ID }
				railcar={ post.railcar }
				commentId={ commentId }
				comment={ comment }
				onLikeToggle={ onLikeToggle }
			/>
		</div>
	);
};

export default CommentActions;
