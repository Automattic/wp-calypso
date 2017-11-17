/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import QueryPosts from 'components/data/query-posts';
import { convertDateToUserLocation } from 'components/post-schedule/utils';
import { decodeEntities, stripHTML } from 'lib/formatting';
import { gmtOffset, timezone } from 'lib/site/utils';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { getSiteComments } from 'state/selectors';
import { getSitePost } from 'state/posts/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

export const CommentListHeader = ( {
	postDate,
	postId,
	postTitle,
	postUrl,
	recordReaderArticleOpened,
	site,
	siteId,
	siteSlug,
	translate,
} ) => {
	const formattedDate = postDate
		? convertDateToUserLocation( postDate, timezone( site ), gmtOffset( site ) ).format( 'll LT' )
		: '';

	const title = postTitle.trim() || translate( 'Untitled' );

	return (
		<div className="comment-list__header">
			<QueryPosts siteId={ siteId } postId={ postId } />

			<HeaderCake
				actionHref={ postUrl }
				actionIcon="visible"
				actionOnClick={ recordReaderArticleOpened }
				actionText={ translate( 'View Post' ) }
				backHref={ `/comments/all/${ siteSlug }` }
			>
				<div className="comment-list__header-title">
					{ translate( 'Comments on {{span}}%(postTitle)s{{/span}}', {
						args: { postTitle: title },
						components: { span: <span className="comment-list__header-post-title" /> },
					} ) }
				</div>
				<div className="comment-list__header-date">{ formattedDate }</div>
			</HeaderCake>
		</div>
	);
};

const mapStateToProps = ( state, { postId } ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const post = getSitePost( state, siteId, postId );
	const postDate = get( post, 'date' );
	const postTitle = decodeEntities(
		stripHTML(
			get( post, 'title' ) ||
				get( post, 'excerpt' ) ||
				get( getSiteComments( state, siteId ), '[0].post.title' )
		)
	);
	const isJetpack = isJetpackSite( state, siteId );

	return {
		postDate,
		postTitle,
		postUrl: isJetpack ? get( post, 'URL' ) : `/read/blogs/${ siteId }/posts/${ postId }`,
		site,
		siteId,
		siteSlug,
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
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentListHeader ) );
