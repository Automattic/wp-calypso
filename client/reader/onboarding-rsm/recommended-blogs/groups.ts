import { __ } from '@wordpress/i18n';
import { getRecommendedBlogs, RECOMMENDED_BLOG_LIST_KEYS } from './index';
import type { RecommendedBlogGroup, RecommendedBlogListKey } from './types';

export const getRecommendedBlogListTitle = ( key: RecommendedBlogListKey ): string => {
	const titles: Record< RecommendedBlogListKey, string > = {
		'most-subscribed': __( 'Most subscribed' ),
		food: __( 'Food' ),
		drinks: __( 'Drinks' ),
		dining: __( 'Dining' ),
		travel: __( 'Travel' ),
		'world-travel': __( 'World travel' ),
		photography: __( 'Photography' ),
		art: __( 'Art' ),
		technology: __( 'Technology' ),
		software: __( 'Software' ),
		nature: __( 'Nature' ),
		science: __( 'Science' ),
		space: __( 'Space' ),
		design: __( 'Design' ),
		diy: __( 'DIY' ),
		music: __( 'Music' ),
		movies: __( 'Movies' ),
		culture: __( 'Culture' ),
	};
	return titles[ key ];
};

const toGroup = ( key: RecommendedBlogListKey ): RecommendedBlogGroup => ( {
	key,
	title: getRecommendedBlogListTitle( key ),
	blogs: getRecommendedBlogs( key ),
} );

/**
 * The recommendation groups for a reader's followed tags, in onboarding order.
 * Only tags with a researched list count; a reader with none of those gets the
 * Most subscribed list. Returns no groups when that list is empty too.
 */
export const getRecommendedBlogGroups = (
	followedTagSlugs: readonly string[]
): RecommendedBlogGroup[] => {
	const followed = new Set( followedTagSlugs );
	const groups = RECOMMENDED_BLOG_LIST_KEYS.filter(
		( key ) => key !== 'most-subscribed' && followed.has( key )
	)
		.map( toGroup )
		.filter( ( group ) => group.blogs.length > 0 );

	if ( groups.length > 0 ) {
		return groups;
	}

	const mostSubscribed = toGroup( 'most-subscribed' );
	return mostSubscribed.blogs.length > 0 ? [ mostSubscribed ] : [];
};
