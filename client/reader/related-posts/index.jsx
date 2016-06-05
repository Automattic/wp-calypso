/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';


/**
 * Internal Dependencies
 */
import { relatedPostsForPost } from 'state/reader/related/selectors';
import { getPost } from 'state/reader/posts/selectors';
import { getSite } from 'state/reader/sites/selectors';
import SmallPost from 'components/post-card/small';
import QueryReaderRelatedPosts from 'components/data/query-reader-related-posts';
import i18n from 'lib/mixins/i18n';

const RelatedPost = React.createClass( {
	render() {
		return <SmallPost post={ this.props.post } site={ this.props.site } />;
	}
} );

const ConnectedRelatedPost = connect(
	( state, ownProps ) => {
		const { post } = ownProps;
		const actualPost = getPost( state, post );
		const site = actualPost && getSite( state, actualPost.site_ID );
		return {
			post: actualPost,
			site
		};
	}
)( RelatedPost );

function RelatedPosts( { siteId, postId, posts } ) {
	if ( ! posts ) {
		return <QueryReaderRelatedPosts siteId={ siteId } postId={ postId } />;
	}
	return (
		<div className="related-posts">
			<h3 className="related-posts__heading">{ i18n.translate( 'Suggested Reading' ) }</h3>
			<ul className="related-posts__list">
				{ posts.map( post => <ConnectedRelatedPost post={ post } /> ) }
			</ul>
		</div>
	);
}

export default connect(
	( state, ownProps ) => {
		return {
			posts: relatedPostsForPost( state, ownProps.siteId, ownProps.postId )
		};
	}
)( RelatedPosts );
