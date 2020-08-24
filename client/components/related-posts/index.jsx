/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { noop, times } from 'lodash';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import { relatedPostsForPost } from 'state/reader/related-posts/selectors';
import { SCOPE_SAME, SCOPE_OTHER } from 'state/reader/related-posts/utils';
import RelatedPost from 'blocks/reader-related-card';
import QueryReaderRelatedPosts from 'components/data/query-reader-related-posts';

function RelatedPosts( {
	siteId,
	postId,
	posts,
	title,
	scope,
	className = '',
	onPostClick = noop,
	onSiteClick = noop,
} ) {
	let listItems;

	if ( ! posts ) {
		// Placeholders
		listItems = times( 2, ( i ) => {
			return (
				/* eslint-disable */
				<li className="reader-related-card__list-item" key={ 'related-post-placeholder-' + i }>
					<RelatedPost post={ null } />
				</li>
				/* eslint-enable */
			);
		} );
	} else if ( posts.length === 0 ) {
		return null;
	} else {
		listItems = posts.map( ( post_id ) => {
			return (
				/* eslint-disable */
				<li key={ post_id } className="reader-related-card__list-item">
					<RelatedPost post={ post_id } onPostClick={ onPostClick } onSiteClick={ onSiteClick } />
				</li>
				/* eslint-enable */
			);
		} );
	}

	return (
		/* eslint-disable */
		<div className={ classnames( 'reader-related-card__blocks', className ) }>
			{ ! posts && <QueryReaderRelatedPosts siteId={ siteId } postId={ postId } scope={ scope } /> }
			<h1 className="reader-related-card__heading">{ title }</h1>
			<ul className="reader-related-card__list">{ listItems }</ul>
		</div>
		/* eslint-enable */
	);
}

export const RelatedPostsFromSameSite = connect( ( state, ownProps ) => {
	return {
		posts: relatedPostsForPost( state, ownProps.siteId, ownProps.postId, SCOPE_SAME ),
		scope: SCOPE_SAME,
	};
} )( RelatedPosts );

export const RelatedPostsFromOtherSites = connect( ( state, ownProps ) => {
	return {
		posts: relatedPostsForPost( state, ownProps.siteId, ownProps.postId, SCOPE_OTHER ),
		scope: SCOPE_OTHER,
	};
} )( RelatedPosts );
