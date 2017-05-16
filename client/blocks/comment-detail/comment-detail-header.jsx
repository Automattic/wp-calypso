/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import CommentDetailActions from './comment-detail-actions';

export const CommentDetailHeader = ( {
	authorAvatarUrl,
	authorDisplayName,
	authorUrl,
	commentContent,
	commentIsApproved,
	commentIsLiked,
	commentIsSpam,
	commentIsTrash,
	edit,
	isExpanded,
	toggleApprove,
	toggleExpanded,
	toggleLike,
	toggleSpam,
	toggleTrash,
} ) => {
	if ( isExpanded ) {
		return (
			<div className="comment-detail__header">
				<div className="comment-detail__actions">
					<a onClick={ toggleExpanded }>
						<Gridicon icon="cross" />
					</a>
				</div>
				<CommentDetailActions
					edit={ edit }
					commentIsApproved={ commentIsApproved }
					commentIsLiked={ commentIsLiked }
					commentIsSpam={ commentIsSpam }
					commentIsTrash={ commentIsTrash }
					toggleApprove={ toggleApprove }
					toggleLike={ toggleLike }
					toggleSpam={ toggleSpam }
					toggleTrash={ toggleTrash }
				/>
			</div>
		);
	}

	return (
		<div className="comment-detail__header is-preview" onClick={ toggleExpanded }>
			<div className="comment-detail__author-info">
				<div className="comment-detail__author-avatar">
					<img src={ authorAvatarUrl } />
				</div>
				<strong>
					{ authorDisplayName }
				</strong>
				<span>
					{ authorUrl }
				</span>
			</div>
			<div className="comment-detail__comment-preview">
				{ commentContent }
			</div>
		</div>
	);
};

export default CommentDetailHeader;
