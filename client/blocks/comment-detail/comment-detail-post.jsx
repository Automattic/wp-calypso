/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SiteIcon from 'blocks/site-icon';
import { decodeEntities } from 'lib/formatting';

export const CommentDetailPost = ( {
	postAuthorDisplayName,
	postTitle,
	postUrl,
	siteId,
} ) =>
	<div className="comment-detail__post">
		<SiteIcon siteId={ siteId } size={ 24 } />
		<div className="comment-detail__post-info">
			<span>
				{ postAuthorDisplayName }
			</span>
			<a href={ postUrl }>
				{ decodeEntities( postTitle ) }
			</a>
		</div>
	</div>;

export default CommentDetailPost;
