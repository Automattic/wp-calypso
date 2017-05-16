/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

export const CommentDetailActions = ( {
	edit,
	commentIsApproved,
	commentIsLiked,
	commentIsSpam,
	commentIsTrash,
	toggleApprove,
	toggleLike,
	toggleSpam,
	toggleTrash,
	translate,
} ) =>
	<div className="comment-detail__actions">
		<a className="comment-detail__action-like" onClick={ toggleLike }>
			<Gridicon icon={ commentIsLiked ? 'star' : 'star-outline' } />
			<span>{
				commentIsLiked
					? translate( 'Liked' )
					: translate( 'Like' )
			}</span>
		</a>
		<a className="comment-detail__action-approve" onClick={ toggleApprove }>
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
		<a className="comment-detail__action-spam" onClick={ toggleSpam }>
			<Gridicon icon="spam" />
			<span>{
				commentIsSpam
					? translate( 'Spam' )
					: translate( 'Mark as Spam' )
			}</span>
		</a>
		<a className="comment-detail__action-trash" onClick={ toggleTrash }>
			<Gridicon icon="trash" />
			<span>{
				commentIsTrash
					? translate( 'Trashed' )
					: translate( 'Trash' )
			}</span>
		</a>
	</div>;

export default localize( CommentDetailActions );
