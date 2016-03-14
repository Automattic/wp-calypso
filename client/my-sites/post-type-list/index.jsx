/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import { getSelectedSite } from 'state/ui/selectors';
import { getSitePostsForQueryIgnoringPage } from 'state/posts/selectors';
import PostTypePost from './post';

function PostTypeList( { type, siteId, posts } ) {
	return (
		<div className="post-type-list">
			<QueryPosts
				siteId={ siteId }
				query={ { type } } />
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
	type: PropTypes.string.isRequired,
	siteId: PropTypes.number,
	posts: PropTypes.array
};

export default connect( ( state, ownProps ) => {
	const site = getSelectedSite( state );
	const siteId = site ? site.ID : null;
	const { type } = ownProps;

	return {
		siteId,
		posts: getSitePostsForQueryIgnoringPage( state, siteId, { type } )
	};
} )( PostTypeList );
