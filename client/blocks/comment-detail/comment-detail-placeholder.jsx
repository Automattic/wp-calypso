/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export const CommentDetailPlaceholder = () =>
	<Card className="comment-detail comment-detail__placeholder is-expanded">
		<div className="comment-detail__header">
			<div className="comment-detail__author-info">
				<div className="comment-detail__author-avatar">
					<span className="comment-detail__author-avatar-image" />
				</div>
			</div>
			<div className="comment-detail__comment-preview" />
		</div>
	</Card>;

export default CommentDetailPlaceholder;
