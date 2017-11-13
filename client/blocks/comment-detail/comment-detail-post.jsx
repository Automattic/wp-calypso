/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Emojify from 'components/emojify';
import Gravatar from 'components/gravatar';
import SiteIcon from 'blocks/site-icon';

export const CommentDetailPost = ( {
	commentId,
	parentCommentAuthorAvatarUrl,
	parentCommentAuthorDisplayName,
	parentCommentContent,
	postAuthorDisplayName,
	postTitle,
	postUrl,
	onClick = noop,
	siteId,
	translate,
} ) => {
	if ( parentCommentContent ) {
		const author = {
			avatar_URL: parentCommentAuthorAvatarUrl,
			display_name: parentCommentAuthorDisplayName,
		};

		return (
			<div className="comment-detail__post">
				<div className="comment-detail__site-icon-author-avatar">
					<SiteIcon siteId={ siteId } size={ 24 } />
					<Gravatar user={ author } />
				</div>
				<div className="comment-detail__post-info">
					{ parentCommentAuthorDisplayName && (
						<span>
							<Emojify>
								{ translate( '%(authorName)s:', {
									args: { authorName: parentCommentAuthorDisplayName },
								} ) }
							</Emojify>
						</span>
					) }
					<a href={ `${ postUrl }#comment-${ commentId }` } onClick={ onClick }>
						<Emojify>{ parentCommentContent }</Emojify>
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="comment-detail__post">
			<SiteIcon siteId={ siteId } size={ 24 } />
			<div className="comment-detail__post-info">
				{ postAuthorDisplayName && (
					<span>
						<Emojify>
							{ translate( '%(authorName)s:', { args: { authorName: postAuthorDisplayName } } ) }
						</Emojify>
					</span>
				) }
				<a href={ postUrl } onClick={ onClick }>
					<Emojify>{ postTitle || translate( 'Untitled' ) }</Emojify>
				</a>
			</div>
		</div>
	);
};

export default localize( CommentDetailPost );
