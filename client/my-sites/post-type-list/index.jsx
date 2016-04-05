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
import {
	isRequestingSitePostsForQuery,
	getSitePostsForQueryIgnoringPage
} from 'state/posts/selectors';
import PostTypeListPost from './post';
import PostTypeListPostPlaceholder from './post-placeholder';
import PostTypeListEmptyContent from './empty-content';

function PostTypeList( { query, siteId, posts, requesting } ) {
	return (
		<div className="post-type-list">
			<QueryPosts
				siteId={ siteId }
				query={ query } />
			{ posts && ! posts.length && ! requesting && (
				<PostTypeListEmptyContent
					type={ query.type }
					status={ query.status } />
			) }
			<ul className="post-type-list__posts">
				{ requesting && (
					<li><PostTypeListPostPlaceholder /></li>
				) }
				{ posts && posts.map( ( post ) => (
					<li key={ post.global_ID }>
						<PostTypeListPost globalId={ post.global_ID } />
					</li>
				) ) }
			</ul>
		</div>
	);
}

PostTypeList.propTypes = {
	query: PropTypes.object,
	siteId: PropTypes.number,
	posts: PropTypes.array,
	requesting: PropTypes.bool
};

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		posts: getSitePostsForQueryIgnoringPage( state, siteId, ownProps.query ),
		requesting: isRequestingSitePostsForQuery( state, siteId, ownProps.query )
	};
} )( PostTypeList );
