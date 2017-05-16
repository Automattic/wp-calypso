/**
 * External dependencies
 */
import React from 'react';

export const CommentDetailPost = ( {
	postAuthorDisplayName,
	postTitle,
	postUrl,
	siteIcon,
	siteName,
} ) =>
	<div className="comment-detail__post">
		<div className="comment-detail__site-icon">
			<img
				alt={ siteName }
				className="comment-detail__site-icon-image"
				src={ siteIcon }
			/>
		</div>
		<div className="comment-detail__post-info">
			<span>
				{ postAuthorDisplayName }
			</span>
			<a href={ postUrl }>
				{ postTitle }
			</a>
		</div>
	</div>;

export default CommentDetailPost;
