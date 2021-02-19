/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import classnames from 'classnames';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { changeCommentStatus } from 'calypso/state/comments/actions';
import CommentLikeButtonContainer from './comment-likes';
import CommentApproveAction from './comment-approve-action';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import PopoverMenuSeparator from 'calypso/components/popover/menu-separator';

/**
 * Style dependencies
 */
import './comment-actions.scss';

const CommentActions = ( {
	post,
	comment: { isPlaceholder, status },
	showModerationTools,
	translate,
	activeEditCommentId,
	activeReplyCommentId,
	commentId,
	handleReply,
	onReplyCancel,
	approveComment,
	unapproveComment,
	trashComment,
	spamComment,
	editComment,
	editCommentCancel,
	showReadMore,
	onReadMore,
} ) => {
	const showReplyButton = post && post.discussion && post.discussion.comments_open === true;
	const showCancelReplyButton = activeReplyCommentId === commentId;
	const showCancelEditButton = activeEditCommentId === commentId;
	const isApproved = status === 'approved';

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
			{ showModerationTools && (
				<div className="comments__comment-actions-moderation-tools">
					<CommentApproveAction { ...{ status, approveComment, unapproveComment } } />
					<Button className="comments__comment-actions-trash" onClick={ trashComment }>
						<Gridicon icon="trash" size={ 18 } />
						<span className="comments__comment-actions-like-label">{ translate( 'Trash' ) }</span>
					</Button>
					<Button className="comments__comment-actions-spam" onClick={ spamComment }>
						<Gridicon icon="spam" size={ 18 } />
						<span className="comments__comment-actions-like-label">{ translate( 'Spam' ) }</span>
					</Button>
					<Button className="comments__comment-actions-edit" onClick={ editComment }>
						<Gridicon icon="pencil" size={ 18 } />
						<span className="comments__comment-actions-like-label">{ translate( 'Edit' ) }</span>
					</Button>
					<EllipsisMenu toggleTitle={ translate( 'More' ) }>
						<PopoverMenuItem
							className={ classnames( 'comments__comment-actions-approve', {
								'is-approved': isApproved,
							} ) }
							icon="checkmark"
							onClick={ ! isApproved ? approveComment : unapproveComment }
						>
							{ isApproved ? translate( 'Approved' ) : translate( 'Approve' ) }
						</PopoverMenuItem>
						<PopoverMenuItem icon="trash" onClick={ trashComment }>
							{ translate( 'Trash' ) }
						</PopoverMenuItem>
						<PopoverMenuItem icon="spam" onClick={ spamComment }>
							{ translate( 'Spam' ) }
						</PopoverMenuItem>
						<PopoverMenuSeparator />
						<PopoverMenuItem icon="pencil" onClick={ editComment }>
							{ translate( 'Edit' ) }
						</PopoverMenuItem>
					</EllipsisMenu>
				</div>
			) }
		</div>
	);
};

CommentActions.defaultProps = {
	onReadMore: noop,
};

const mapDispatchToProps = ( dispatch, ownProps ) => {
	const {
		post: { site_ID: siteId, ID: postId },
		commentId,
	} = ownProps;

	return {
		approveComment: () => dispatch( changeCommentStatus( siteId, postId, commentId, 'approved' ) ),
		unapproveComment: () =>
			dispatch( changeCommentStatus( siteId, postId, commentId, 'unapproved' ) ),
		trashComment: () => dispatch( changeCommentStatus( siteId, postId, commentId, 'trash' ) ),
		spamComment: () => dispatch( changeCommentStatus( siteId, postId, commentId, 'spam' ) ),
	};
};

export default connect( null, mapDispatchToProps )( localize( CommentActions ) );
