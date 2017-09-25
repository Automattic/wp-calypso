/**
 * External dependencies
 */
import classnames from 'classnames';
import { noop, times } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import RelatedPost from 'blocks/reader-related-card-v2';
import QueryReaderRelatedPosts from 'components/data/query-reader-related-posts';
import { relatedPostsForPost } from 'state/reader/related-posts/selectors';
import { SCOPE_SAME, SCOPE_OTHER } from 'state/reader/related-posts/utils';

function RelatedPosts( { siteId, postId, posts, title, scope, className = '', onPostClick = noop, onSiteClick = noop } ) {
	let listItems;

	if ( ! posts ) {
		// Placeholders
		listItems = times( 2, i => {
			return (
				<li className="reader-related-card-v2__list-item" key={ 'related-post-placeholder-' + i }>
					<RelatedPost post={ null } />
				</li>
			);
		} );
	} else if ( posts.length === 0 ) {
		return null;
	} else {
		listItems = posts.map( post_id => {
			return (
				<li key={ post_id } className="reader-related-card-v2__list-item">
					<RelatedPost post={ post_id } onPostClick={ onPostClick } onSiteClick={ onSiteClick } />
				</li>
			);
		} );
	}

	return (
		<div className={ classnames( 'reader-related-card-v2__blocks', className ) }>
			{ ! posts && <QueryReaderRelatedPosts siteId={ siteId } postId={ postId } scope={ scope } /> }
			<h1 className="reader-related-card-v2__heading">{ title }</h1>
			<ul className="reader-related-card-v2__list">
				{ listItems }
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
