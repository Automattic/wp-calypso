/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import { decodeEntities, stripHTML } from 'lib/formatting';
import { getSiteComment } from 'state/selectors';
import { getSitePost } from 'state/posts/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

const CommentPostLink = ( {
	isExpanded,
	isPostTitleLoaded,
	postId,
	postTitle,
	siteId,
	siteSlug,
	status,
	translate,
} ) => (
	<div className="comment__post-link">
		{ ! isPostTitleLoaded && <QueryPosts siteId={ siteId } postId={ postId } /> }

		<Gridicon icon={ isExpanded ? 'posts' : 'chevron-right' } size={ 18 } />

		<a href={ `/comments/${ status }/${ siteSlug }/${ postId }` }>
			{ postTitle.trim() || translate( 'Untitled' ) }
		</a>
	</div>
);

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );

	const comment = getSiteComment( state, siteId, commentId );
	const commentStatus = get( comment, 'status' );

	const postId = get( comment, 'post.ID' );
	const post = getSitePost( state, siteId, postId );
	const postTitle =
		decodeEntities( get( comment, 'post.title' ) ) ||
		decodeEntities( stripHTML( get( post, 'excerpt' ) ) );

	return {
		isPostTitleLoaded: !! postTitle || !! post,
		postId,
		postTitle,
		siteSlug,
		siteId,
		status: 'unapproved' === commentStatus ? 'pending' : commentStatus,
	};
};

export default connect( mapStateToProps )( localize( CommentPostLink ) );
