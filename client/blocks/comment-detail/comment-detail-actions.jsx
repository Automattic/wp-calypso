/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { isEnabled } from 'config';

const commentActions = {
	unapproved: [ 'like', 'approve', 'edit', 'spam', 'trash' ],
	approved: [ 'like', 'approve', 'edit', 'spam', 'trash' ],
	spam: [ 'approve', 'delete' ],
	trash: [ 'approve', 'spam', 'delete' ],
};

const hasAction = ( status, action ) => includes( commentActions[ status ], action );

export const CommentDetailActions = ( {
	commentIsLiked,
	commentStatus,
	deleteCommentPermanently,
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
		<div className="comment-detail__actions">
			{ hasAction( commentStatus, 'like' ) &&
				<Button
					borderless
					className={ classNames( 'comment-detail__action-like', { 'is-liked': commentIsLiked } ) }
					onClick={ toggleLike }
				>
					<Gridicon icon={ commentIsLiked ? 'star' : 'star-outline' } />
					<span>{
						commentIsLiked
							? translate( 'Liked' )
							: translate( 'Like' )
					}</span>
				</Button>
			}

			{ hasAction( commentStatus, 'approve' ) &&
				<Button
					borderless
					className={ classNames( 'comment-detail__action-approve', { 'is-approved': isApproved } ) }
					onClick={ toggleApprove }
				>
					<Gridicon icon={ isApproved ? 'checkmark-circle' : 'checkmark' } />
					<span>{
						isApproved
							? translate( 'Approved' )
							: translate( 'Approve' )
					}</span>
				</Button>
			}

			{ hasAction( commentStatus, 'edit' ) && isEnabled( 'comments/management/edit' ) &&
				<Button
					borderless
					className="comment-detail__action-edit"
					onClick={ toggleEditMode }
				>
					<Gridicon icon="pencil" />
					<span>{ translate( 'Edit' ) }</span>
				</Button>
			}

			{ hasAction( commentStatus, 'spam' ) &&
				<Button
					borderless
					className={ classNames( 'comment-detail__action-spam', { 'is-spam': isSpam } ) }
					onClick={ toggleSpam }
				>
					<Gridicon icon="spam" />
					<span>{
						isSpam
							? translate( 'Spammed' )
							: translate( 'Spam' )
					}</span>
				</Button>
			}

			{ hasAction( commentStatus, 'trash' ) &&
				<Button
					borderless
					className={ classNames( 'comment-detail__action-trash', { 'is-trash': isTrash } ) }
					onClick={ toggleTrash }
				>
					<Gridicon icon="trash" />
					<span>{
						isTrash
							? translate( 'Trashed' )
							: translate( 'Trash' )
					}</span>
				</Button>
			}

			{ hasAction( commentStatus, 'delete' ) &&
				<Button
					borderless
					className="comment-detail__action-delete"
					onClick={ deleteCommentPermanently }
				>
					<Gridicon icon="trash" />
					<span>{ translate( 'Delete Permanently' ) }</span>
				</Button>
			}
		</div>
	);
};

export default localize( CommentDetailActions );
