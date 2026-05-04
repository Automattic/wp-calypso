import { SCOPE_OTHER, SCOPE_SAME } from '@automattic/api-core';
import clsx from 'clsx';
import { times } from 'lodash';
import RelatedPost from 'calypso/blocks/reader-related-card';
import { withReaderRelatedPosts } from 'calypso/components/data/with-reader-related-posts';

const noop = () => {};

function RelatedPosts( { posts, title, className = '', onPostClick = noop, onSiteClick = noop } ) {
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
		<div className={ clsx( 'reader-related-card__blocks', className ) }>
			<h1 className="reader-related-card__heading">{ title }</h1>
			<ul className="reader-related-card__list">{ listItems }</ul>
		</div>
		/* eslint-enable */
	);
}

export const RelatedPostsFromSameSite = withReaderRelatedPosts( SCOPE_SAME )( RelatedPosts );
export const RelatedPostsFromOtherSites = withReaderRelatedPosts( SCOPE_OTHER )( RelatedPosts );
