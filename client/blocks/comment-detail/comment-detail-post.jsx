/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SiteIcon from 'blocks/site-icon';
import { decodeEntities, stripHTML } from 'lib/formatting';

export const CommentDetailPost = ( {
	parentComment,
	postAuthorDisplayName,
	postTitle,
	postUrl,
	siteId,
} ) => {
	if ( parentComment ) {
		return (
			<div className="comment-detail__post">
				<div className="comment-detail__site-icon-author-avatar">
					<SiteIcon siteId={ siteId } size={ 24 } />
					<img className="comment-detail__author-avatar-image" src={ parentComment.author.avatar_URL } />
				</div>
				<div className="comment-detail__post-info">
					<span>
						{ parentComment.author.name }
					</span>
					<a href={ parentComment.URL }>
						{ decodeEntities( stripHTML( parentComment.content ) ) }
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
