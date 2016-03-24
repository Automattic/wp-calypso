/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePostsForQueryIgnoringPage } from 'state/posts/selectors';
import PostTypePost from './post';

function PostTypeList( { query, siteId, posts } ) {
	return (
		<div className="post-type-list">
			<QueryPosts
				siteId={ siteId }
				query={ query } />
			<ul className="post-type-list__posts">
				{ posts && posts.map( ( post ) => (
					<li key={ post.global_ID }>
						<PostTypePost globalId={ post.global_ID } />
					</li>
				) ) }
			</ul>
		</div>
	);
}

PostTypeList.propTypes = {
	query: PropTypes.object,
	siteId: PropTypes.number,
	posts: PropTypes.array
};

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		posts: getSitePostsForQueryIgnoringPage( state, siteId, ownProps.query )
	};
} )( PostTypeList );
