/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { includes } from 'lodash';

const commentActions = {
	unapproved: [ 'like', 'approve', 'edit', 'spam', 'trash' ],
	approved: [ 'like', 'approve', 'edit', 'spam', 'trash' ],
	spam: [ 'approve', 'edit', 'delete' ],
	trash: [ 'approve', 'edit', 'spam', 'delete' ],
};

const hasAction = ( status, action ) => includes( commentActions[ status ], action );

export const CommentDetailActions = ( {
	edit,
	commentIsLiked,
	commentStatus,
	deleteCommentPermanently,
	toggleApprove,
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
				<a
					className={ classNames( 'comment-detail__action-like', { 'is-liked': commentIsLiked } ) }
					onClick={ toggleLike }
				>
					<Gridicon icon={ commentIsLiked ? 'star' : 'star-outline' } />
					<span>{
						commentIsLiked
							? translate( 'Liked' )
							: translate( 'Like' )
					}</span>
				</a>
			}

			{ hasAction( commentStatus, 'approve' ) &&
				<a
					className={ classNames( 'comment-detail__action-approve', { 'is-approved': isApproved } ) }
					onClick={ toggleApprove }
				>
					<Gridicon icon={ isApproved ? 'checkmark-circle' : 'checkmark' } />
					<span>{
						isApproved
							? translate( 'Approved' )
							: translate( 'Approve' )
					}</span>
				</a>
			}

			{ hasAction( commentStatus, 'edit' ) &&
				<a className="comment-detail__action-edit" onClick={ edit }>
					<Gridicon icon="pencil" />
					<span>{ translate( 'Edit' ) }</span>
				</a>
			}

			{ hasAction( commentStatus, 'spam' ) &&
				<a
					className={ classNames( 'comment-detail__action-spam', { 'is-spam': isSpam } ) }
					onClick={ toggleSpam }
				>
					<Gridicon icon="spam" />
					<span>{
						isSpam
							? translate( 'Spammed' )
							: translate( 'Spam' )
					}</span>
				</a>
			}

			{ hasAction( commentStatus, 'trash' ) &&
				<a
					className={ classNames( 'comment-detail__action-trash', { 'is-trash': isTrash } ) }
					onClick={ toggleTrash }
				>
					<Gridicon icon="trash" />
					<span>{
						isTrash
							? translate( 'Trashed' )
							: translate( 'Trash' )
					}</span>
				</a>
			}

			{ hasAction( commentStatus, 'delete' ) &&
				<a
					className="comment-detail__action-delete"
					onClick={ deleteCommentPermanently }
				>
					<Gridicon icon="trash" />
					<span>{ translate( 'Delete Permanently' ) }</span>
				</a>
			}
		</div>
	);
};

export default localize( CommentDetailActions );
