/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSitePostsForQuery, isRequestingSitePostsForQuery } from 'state/posts/selectors';
import QueryPosts from 'components/data/query-posts';
import Typeahead from 'components/typeahead';
import PostsTypeaheadResult from './result';

function PostsTypeahead( { siteId, search, onSearch, searching, posts } ) {
	return (
		<div className="posts-typeahead">
			{ search && (
				<QueryPosts
					siteId={ siteId }
					query={ { search } } />
			) }
			<Typeahead
				value={ search }
				onSearch={ onSearch }
				searching={ searching }>
				{ posts ? posts.map( ( post ) => {
					return (
						<PostsTypeaheadResult
							key={ post.global_ID }
							title={ post.title }
							type={ post.type } />
					);
				} ) : null }
			</Typeahead>
		</div>
	);
}

PostsTypeahead.propTypes = {
	siteId: PropTypes.number.isRequired,
	search: PropTypes.string,
	onSearch: PropTypes.func,
	searching: PropTypes.bool,
	posts: PropTypes.array
};

export default connect( ( state, ownProps ) => {
	const { siteId, search } = ownProps;
	return {
		posts: getSitePostsForQuery( state, siteId, { search } ),
		searching: isRequestingSitePostsForQuery( state, siteId, { search } )
	};
} )( PostsTypeahead );
