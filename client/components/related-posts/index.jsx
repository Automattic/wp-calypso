import { SCOPE_OTHER, SCOPE_SAME } from '@automattic/api-core';
import { times } from '@automattic/js-utils';
import clsx from 'clsx';
import RelatedPostCard from 'calypso/blocks/reader-related-card';
import { useRelatedPosts } from 'calypso/components/data/with-reader-related-posts';

const noop = () => {};

function RelatedPosts( { posts, title, className = '', onPostClick = noop, onSiteClick = noop } ) {
	let listItems;

	if ( ! posts ) {
		// Placeholders
		listItems = times( 2, ( i ) => {
			return (
				<li className="reader-related-card__list-item" key={ 'related-post-placeholder-' + i }>
					<RelatedPostCard post={ null } />
				</li>
			);
		} );
	} else if ( posts.length === 0 ) {
		return null;
	} else {
		listItems = posts.map( ( post ) => {
			return (
				<li key={ post.global_ID } className="reader-related-card__list-item">
					<RelatedPostCard post={ post } onPostClick={ onPostClick } onSiteClick={ onSiteClick } />
				</li>
			);
		} );
	}

	return (
		<div className={ clsx( 'reader-related-card__blocks', className ) }>
			<h1 className="reader-related-card__heading">{ title }</h1>
			<ul className="reader-related-card__list">{ listItems }</ul>
		</div>
	);
}

export const RelatedPostsFromSameSite = ( { siteId, postId, ...props } ) => {
	const { posts, isError } = useRelatedPosts( siteId, postId, SCOPE_SAME );

	if ( isError && ! posts ) {
		return null;
	}

	return <RelatedPosts { ...props } posts={ posts } />;
};

export const RelatedPostsFromOtherSites = ( { siteId, postId, ...props } ) => {
	const { posts, isError } = useRelatedPosts( siteId, postId, SCOPE_OTHER );

	if ( isError && ! posts ) {
		return null;
	}

	return <RelatedPosts { ...props } posts={ posts } />;
};
