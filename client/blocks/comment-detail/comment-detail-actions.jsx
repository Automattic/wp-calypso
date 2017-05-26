/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

export const CommentDetailActions = ( {
	edit,
	commentIsApproved,
	commentIsLiked,
	commentIsSpam,
	commentIsTrash,
	deleteForever,
	toggleApprove,
	toggleLike,
	toggleSpam,
	toggleTrash,
	translate,
} ) =>
	<div className="comment-detail__actions">
		{ ! commentIsSpam && ! commentIsTrash &&
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
		<a
			className={ classNames( 'comment-detail__action-approve', { 'is-approved': commentIsApproved } ) }
			onClick={ toggleApprove }
		>
			<Gridicon icon={ commentIsApproved ? 'checkmark-circle' : 'checkmark' } />
			<span>{
				commentIsApproved
					? translate( 'Approved' )
					: translate( 'Approve' )
			}</span>
		</a>
		<a className="comment-detail__action-edit" onClick={ edit }>
			<Gridicon icon="pencil" />
			<span>{ translate( 'Edit' ) }</span>
		</a>
		{ ! commentIsSpam &&
			<a
				className={ classNames( 'comment-detail__action-spam', { 'is-spam': commentIsSpam } ) }
				onClick={ toggleSpam }
			>
				<Gridicon icon="spam" />
				<span>{
					commentIsSpam
						? translate( 'Spam' )
						: translate( 'Mark as Spam' )
				}</span>
			</a>
		}
		{ ! commentIsSpam && ! commentIsTrash &&
			<a
				className={ classNames( 'comment-detail__action-trash', { 'is-trash': commentIsTrash } ) }
				onClick={ toggleTrash }
			>
				<Gridicon icon="trash" />
				<span>{
					commentIsTrash
						? translate( 'Trashed' )
						: translate( 'Trash' )
				}</span>
			</a>
		}
		{ ( commentIsSpam || commentIsTrash ) &&
			<a
				className="comment-detail__action-delete"
				onClick={ deleteForever }
			>
				<Gridicon icon="trash" />
				<span>{ translate( 'Delete Permanently' ) }</span>
			</a>
		}
	</div>;

export default localize( CommentDetailActions );
