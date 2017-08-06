/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
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
					{ parentCommentAuthorDisplayName &&
						<span>
							{ translate( '%(authorName)s:', { args: { authorName: parentCommentAuthorDisplayName } } ) }
						</span>
					}
					<a href={ `${ postUrl }#comment-${ commentId }` }>
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
				{ postAuthorDisplayName &&
					<span>
						{ translate( '%(authorName)s:', { args: { authorName: postAuthorDisplayName } } ) }
					</span>
				}
				<a href={ postUrl }>
					{ postTitle || translate( 'Untitled' ) }
				</a>
			</div>
		</div>
	);
};

export default localize( CommentDetailPost );
