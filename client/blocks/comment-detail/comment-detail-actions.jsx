/** @format */

/**
 * External dependencies
 */

import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import ButtonGroup from 'components/button-group';
import Button from 'components/button';

const commentActions = {
	unapproved: [ 'like', 'approve', 'edit', 'reply', 'spam', 'trash' ],
	approved: [ 'like', 'approve', 'edit', 'reply', 'spam', 'trash' ],
	spam: [ 'approve', 'delete' ],
	trash: [ 'approve', 'spam', 'delete' ],
};

const hasAction = ( status, action ) => includes( commentActions[ status ], action );

const CommentDetailActionsContainer = ( { compact, children } ) =>
	compact ? (
		<div className="comment-detail__actions is-quick">
			<ButtonGroup>{ children }</ButtonGroup>
		</div>
	) : (
		<div className="comment-detail__actions">{ children }</div>
	);

export const CommentDetailActions = ( {
	compact,
	commentIsLiked,
	commentStatus,
	deleteCommentPermanently,
	toggleReply,
	toggleApprove,
	toggleEditMode,
	toggleLike,
	toggleSpam,
	toggleTrash,
	translate,
} ) => {
	const isApproved = 'approved' === commentStatus;
	const isSpam = 'spam' === commentStatus;
	const isTrash = 'trash' === commentStatus;

	return (
		<CommentDetailActionsContainer { ...{ compact } }>
			{ hasAction( commentStatus, 'reply' ) &&
				compact && (
					<Button
						compact={ compact }
						className="comment-detail__action-edit"
						onClick={ toggleReply }
					>
						<Gridicon icon="reply" />
					</Button>
				) }

			{ hasAction( commentStatus, 'like' ) && (
				<Button
					{ ...{ borderless: ! compact, compact } }
					className={ classNames( 'comment-detail__action-like', { 'is-liked': commentIsLiked } ) }
					onClick={ toggleLike }
				>
					<Gridicon icon={ commentIsLiked ? 'star' : 'star-outline' } />
					{ compact || (
						<span>{ commentIsLiked ? translate( 'Liked' ) : translate( 'Like' ) }</span>
					) }
				</Button>
			) }

			{ hasAction( commentStatus, 'approve' ) && (
				<Button
					{ ...{ borderless: ! compact, compact } }
					className={ classNames( 'comment-detail__action-approve', {
						'is-approved': isApproved,
					} ) }
					onClick={ toggleApprove }
				>
					<Gridicon icon={ isApproved ? 'checkmark-circle' : 'checkmark' } />
					{ compact || (
						<span>{ isApproved ? translate( 'Approved' ) : translate( 'Approve' ) }</span>
					) }
				</Button>
			) }

			{ hasAction( commentStatus, 'edit' ) &&
				! compact && (
					<Button
						{ ...{ borderless: ! compact, compact } }
						className="comment-detail__action-edit"
						onClick={ toggleEditMode }
					>
						<Gridicon icon="pencil" />
						{ compact || <span>{ translate( 'Edit' ) }</span> }
					</Button>
				) }

			{ hasAction( commentStatus, 'spam' ) && (
				<Button
					{ ...{ borderless: ! compact, compact } }
					className={ classNames( 'comment-detail__action-spam', { 'is-spam': isSpam } ) }
					onClick={ toggleSpam }
				>
					<Gridicon icon="spam" />
					{ compact || <span>{ isSpam ? translate( 'Spammed' ) : translate( 'Spam' ) }</span> }
				</Button>
			) }

			{ hasAction( commentStatus, 'trash' ) && (
				<Button
					{ ...{ borderless: ! compact, compact } }
					className={ classNames( 'comment-detail__action-trash', { 'is-trash': isTrash } ) }
					onClick={ toggleTrash }
				>
					<Gridicon icon="trash" />
					{ compact || <span>{ isTrash ? translate( 'Trashed' ) : translate( 'Trash' ) }</span> }
				</Button>
			) }

			{ hasAction( commentStatus, 'delete' ) && (
				<Button
					{ ...{ borderless: ! compact, compact } }
					className="comment-detail__action-delete"
					onClick={ deleteCommentPermanently }
				>
					<Gridicon icon="trash" />
					{ compact || <span>{ translate( 'Delete Permanently' ) }</span> }
				</Button>
			) }
		</CommentDetailActionsContainer>
	);
};

export default localize( CommentDetailActions );
