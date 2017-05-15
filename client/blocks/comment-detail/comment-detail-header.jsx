/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

export const CommentDetailHeader = ( {
	author,
	commentBody,
	isExpanded,
	toggleExpanded,
	translate,
} ) => {
	if ( isExpanded ) {
		return (
			<div className="comment-detail__header">
				<div className="comment-detail__actions">
					<a onClick={ toggleExpanded }>
						<Gridicon icon="cross" />
					</a>
				</div>
				<div className="comment-detail__actions">
					<a>
						<Gridicon icon="star-outline" />
						<span>{ translate( 'Like' ) }</span>
					</a>
					<a>
						<Gridicon icon="checkmark" />
						<span>{ translate( 'Approve' ) }</span>
					</a>
					<a>
						<Gridicon icon="pencil" />
						<span>{ translate( 'Edit' ) }</span>
					</a>
					<a>
						<Gridicon icon="spam" />
						<span>{ translate( 'Spam' ) }</span>
					</a>
					<a>
						<Gridicon icon="trash" />
						<span>{ translate( 'Trash' ) }</span>
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="comment-detail__header is-preview" onClick={ toggleExpanded }>
			<div className="comment-detail__author-info">
				<div className="comment-detail__author-avatar">
					<img src={ author.avatar_URL } />
				</div>
				<strong>
					{ author.name }
				</strong>
				<span>
					{ author.URL }
				</span>
			</div>
			<div className="comment-detail__comment-preview">
				{ commentBody }
			</div>
		</div>
	);
};

export default localize( CommentDetailHeader );
