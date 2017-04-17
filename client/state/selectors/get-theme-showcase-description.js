/**
 * External dependencies
 */
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { findThemeFilterTerm, getThemeFilterTerm } from './';

export default function getThemeShowcaseDescription( state, { filter, tier, vertical } = {} ) {
	// If we have a vertical, use its description
	const description = get( getThemeFilterTerm( state, 'subject', vertical ), 'description' );
	if ( description ) {
		return description;
	}

	// If we have *one* filter, use its description
	if ( filter && ! includes( filter, ',' ) ) {
		const filterDescription = get( findThemeFilterTerm( state, filter ), 'description' );
		if ( filterDescription ) {
			return filterDescription;
		}
	}

	if ( tier === 'free' ) {
		return 'Discover Free WordPress Themes on the WordPress.com Theme Showcase.';
	} else if ( tier === 'premium' ) {
		return 'Discover Premium WordPress Themes on the WordPress.com Theme Showcase.';
	}

	return 'Beautiful, responsive, free and premium WordPress themes ' +
    'for your photography site, portfolio, magazine, business website, or blog.';
}
