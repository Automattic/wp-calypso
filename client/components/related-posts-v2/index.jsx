/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';

/**
 * Internal Dependencies
 */
import { relatedPostsForPost } from 'state/reader/related-posts/selectors';
import { SCOPE_SAME, SCOPE_OTHER } from 'state/reader/related-posts/utils';
import RelatedPost from 'blocks/reader-related-card-v2';
import QueryReaderRelatedPosts from 'components/data/query-reader-related-posts';

function RelatedPosts( { siteId, postId, posts, title, scope, onPostClick = noop, onSiteClick = noop } ) {
	if ( ! posts ) {
		return <QueryReaderRelatedPosts siteId={ siteId } postId={ postId } scope={ scope } />;
	}
	if ( ! posts.length ) {
		return null;
	}
	return (
		<div className="reader-related-card-v2__blocks">
			<h1 className="reader-related-card-v2__heading">{ title }</h1>
			<ul className="reader-related-card-v2__list">
				{ posts.map( post_id => {
					return ( <li key={ post_id } className="reader-related-card-v2__list-item">
							<RelatedPost post={ post_id } onPostClick={ onPostClick } onSiteClick={ onSiteClick } />
						</li> );
				} )
				}
			</ul>
		</div>
	);
}

export const RelatedPostsFromSameSite = connect(
	( state, ownProps ) => {
		return {
			posts: relatedPostsForPost( state, ownProps.siteId, ownProps.postId, SCOPE_SAME ),
			scope: SCOPE_SAME
		};
	}
)( RelatedPosts );

export const RelatedPostsFromOtherSites = connect(
	( state, ownProps ) => {
		return {
			posts: relatedPostsForPost( state, ownProps.siteId, ownProps.postId, SCOPE_OTHER ),
			scope: SCOPE_OTHER
		};
	}
)( RelatedPosts );
