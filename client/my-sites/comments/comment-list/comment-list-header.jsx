/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import QueryPosts from 'components/data/query-posts';
import { convertDateToUserLocation } from 'components/post-schedule/utils';
import { decodeEntities, stripHTML } from 'lib/formatting';
import { gmtOffset, timezone } from 'lib/site/utils';
import { getSiteComments } from 'state/selectors';
import { getSitePost } from 'state/posts/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

export const CommentListHeader = ( {
	postDate,
	postId,
	postTitle,
	site,
	siteId,
	siteSlug,
	translate,
} ) => {
	const formattedDate = postDate
		? convertDateToUserLocation( postDate, timezone( site ), gmtOffset( site ) ).format( 'll LT' )
		: '';

	return (
		<div className="comment-list__header">
			<QueryPosts siteId={ siteId } postId={ postId } />

			<HeaderCake
				actionHref={ `/comments/all/${ siteSlug }/${ postId }` }
				actionIcon="visible"
				actionOnClick={ noop }
				actionText={ translate( 'View Post' ) }
				backHref={ `/comments/all/${ siteSlug }` }
			>
				<div className="comment-list__header-title">{ postTitle }</div>
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

	return {
		postDate,
		postTitle,
		site,
		siteId,
		siteSlug,
	};
};

export default connect( mapStateToProps )( localize( CommentListHeader ) );
