/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SiteIcon from 'blocks/site-icon';
import Emojify from 'components/emojify';
import Gravatar from 'components/gravatar';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';

export const CommentDetailPost = ( {
	commentId,
	parentCommentAuthorAvatarUrl,
	parentCommentAuthorDisplayName,
	parentCommentContent,
	postAuthorDisplayName,
	postTitle,
	postUrl,
	recordReaderArticleOpened,
	recordReaderCommentOpened,
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
							<Emojify>
								{ translate( '%(authorName)s:', { args: { authorName: parentCommentAuthorDisplayName } } ) }
							</Emojify>
						</span>
					}
					<a href={ `${ postUrl }#comment-${ commentId }` } onClick={ recordReaderCommentOpened }>
						<Emojify>
							{ parentCommentContent }
						</Emojify>
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
						<Emojify>
							{ translate( '%(authorName)s:', { args: { authorName: postAuthorDisplayName } } ) }
						</Emojify>
					</span>
				}
				<a href={ postUrl } onClick={ recordReaderArticleOpened }>
					<Emojify>
						{ postTitle || translate( 'Untitled' ) }
					</Emojify>
				</a>
			</div>
		</div>
	);
};

const mapDispatchToProps = dispatch => ( {
	recordReaderArticleOpened: () => dispatch( composeAnalytics(
		recordTracksEvent( 'calypso_comment_management_article_opened' ),
		bumpStat( 'calypso_comment_management', 'article_opened' )
	) ),
	recordReaderCommentOpened: () => dispatch( composeAnalytics(
		recordTracksEvent( 'calypso_comment_management_comment_opened' ),
		bumpStat( 'calypso_comment_management', 'comment_opened' )
	) ),
} );

export default connect( null, mapDispatchToProps )( localize( CommentDetailPost ) );
