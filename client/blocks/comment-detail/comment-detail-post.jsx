/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';

export const CommentDetailPost = ( {
	author,
	siteIcon,
	title,
	url,
} ) =>
	<div className="comment-detail__post">
		<ReaderAvatar
			author={ author }
			isCompact
			showPlaceholder
			siteIcon={ siteIcon }
		/>
		<div className="comment-detail__post-info">
			<span>
				{ author.name }
			</span>
			<a href={ url }>
				{ title }
			</a>
		</div>
	</div>;

export default CommentDetailPost;
