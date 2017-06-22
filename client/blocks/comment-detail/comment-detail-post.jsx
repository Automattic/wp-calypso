/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SiteIcon from 'blocks/site-icon';

export const CommentDetailPost = ( {
	parentCommentAuthorAvatarUrl,
	parentCommentAuthorDisplayName,
	parentCommentContent,
	parentCommentUrl,
	postAuthorDisplayName,
	postTitle,
	postUrl,
	siteId,
} ) => {
	if ( parentCommentContent ) {
		return (
			<div className="comment-detail__post">
				<div className="comment-detail__site-icon-author-avatar">
					<SiteIcon siteId={ siteId } size={ 24 } />
					<img className="comment-detail__author-avatar-image" src={ parentCommentAuthorAvatarUrl } />
				</div>
				<div className="comment-detail__post-info">
					<span>
						{ parentCommentAuthorDisplayName }
					</span>
					<a href={ parentCommentUrl }>
						{ parentCommentContent }
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="comment-detail__post">
			<SiteIcon siteId={ siteId } size={ 24 } />
			<div className="comment-detail__post-info">
				<span>
					{ postAuthorDisplayName }
				</span>
				<a href={ postUrl }>
					{ postTitle }
				</a>
			</div>
		</div>
	);
};

export default CommentDetailPost;
