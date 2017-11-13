/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export const CommentDetailPlaceholder = () => (
	<Card className="comment-detail comment-detail__placeholder">
		<div className="comment-detail__header is-preview">
			<div className="comment-detail__author-preview">
				<div className="comment-detail__author-avatar gravatar" />
			</div>
			<div className="comment-detail__comment-preview" />
		</div>
	</Card>
);

export default CommentDetailPlaceholder;
