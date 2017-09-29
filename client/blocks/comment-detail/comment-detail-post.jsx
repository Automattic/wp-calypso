/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Emojify from 'components/emojify';
import Gravatar from 'components/gravatar';
import SiteIcon from 'blocks/site-icon';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { decodeEntities, stripHTML } from 'lib/formatting';
import { getPostCommentsTree } from 'state/comments/selectors';
import { getSiteComment } from 'state/selectors';
import { getGravatarUser, getPostTitle, getPostReaderUrl } from './utils';

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
		const gravatarUser = getGravatarUser( {
			avatarUrl: parentCommentAuthorAvatarUrl,
			displayName: parentCommentAuthorDisplayName,
		} );

		return (
			<div className="comment-detail__post">
				<div className="comment-detail__site-icon-author-avatar">
					<SiteIcon siteId={ siteId } size={ 24 } />
					<Gravatar user={ gravatarUser } />
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

const mapStateToProps = ( state, { commentId, siteId } ) => {
	const comment = getSiteComment( state, siteId, commentId );

	const postId = get( comment, 'post.ID' );
	const commentsTree = getPostCommentsTree( state, siteId, postId, 'all' );
	const parentCommentId = get( commentsTree, [ commentId, 'data', 'parent', 'ID' ], 0 );
	const parentComment = get( commentsTree, [ parentCommentId, 'data' ], {} );
	const parentCommentContent = decodeEntities( stripHTML( get( parentComment, 'content' ) ) );

	return {
		parentCommentAuthorAvatarUrl: get( parentComment, 'author.avatar_URL' ),
		parentCommentAuthorDisplayName: get( parentComment, 'author.name' ),
		parentCommentContent,
		// postAuthorDisplayName: get( comment, 'post.author.name' ), TODO: not available in the current data structure
		postTitle: getPostTitle( comment ),
		postUrl: getPostReaderUrl( siteId, postId ),
	};
};

const mapDispatchToProps = dispatch => ( {
	recordReaderArticleOpened: () =>
		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_comment_management_article_opened' ),
				bumpStat( 'calypso_comment_management', 'article_opened' )
			)
		),
	recordReaderCommentOpened: () =>
		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_comment_management_comment_opened' ),
				bumpStat( 'calypso_comment_management', 'comment_opened' )
			)
		),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentDetailPost ) );
