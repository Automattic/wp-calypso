/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

export const CommentActions = ( {
	translate,
} ) =>
	<div className="comment-detail__actions">
		<div className="comment-detail__action-like">
			<Gridicon icon="star-outline" size={ 24 } />
			<span>{ translate( 'Like' ) }</span>
		</div>
		<div className="comment-detail__action-approve">
			<Gridicon icon="checkmark" size={ 24 } />
			<span>{ translate( 'Approve' ) }</span>
		</div>
		<div className="comment-detail__action-edit">
			<Gridicon icon="pencil" size={ 24 } />
			<span>{ translate( 'Edit' ) }</span>
		</div>
		<div className="comment-detail__action-spam">
			<Gridicon icon="spam" size={ 24 } />
			<span>{ translate( 'Spam' ) }</span>
		</div>
		<div className="comment-detail__action-trash">
			<Gridicon icon="trash" size={ 24 } />
			<span>{ translate( 'Trash' ) }</span>
		</div>
	</div>;

export default localize( CommentActions );
