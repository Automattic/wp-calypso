/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import Gravatar from 'components/gravatar';
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
					<ExternalLink href={ parentCommentUrl }>
						{ parentCommentContent }
					</ExternalLink>
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
