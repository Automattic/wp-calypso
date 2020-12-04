/**
 * External dependencies
 */
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { findThemeFilterTerm } from 'calypso/state/themes/selectors/find-theme-filter-term';
import { getThemeFilterTerm } from 'calypso/state/themes/selectors/get-theme-filter-term';

import 'calypso/state/themes/init';

export function getThemeShowcaseDescription( state, { filter, tier, vertical } = {} ) {
	if ( vertical ) {
		const description = get( getThemeFilterTerm( state, 'subject', vertical ), 'description' );
		if ( description ) {
			return description;
		}
		return (
			`Discover ${ vertical } WordPress Themes on the WordPress.com Showcase. ` +
			'Here you can browse and find the best WordPress designs available on ' +
			'WordPress.com to discover the one that is just right for you.'
		);
	}

	// If we have *one* filter, use its description
	if ( filter && ! includes( filter, '+' ) ) {
		const filterDescription = get( findThemeFilterTerm( state, filter ), 'description' );
		if ( filterDescription ) {
			return filterDescription;
		}
		return (
			`Discover WordPress Themes supporting ${ filter } on the WordPress.com Showcase. ` +
			'Here you can browse and find the best WordPress designs available on WordPress.com ' +
			'to discover the one that is just right for you.'
		);
	}

	if ( tier === 'free' ) {
		return 'Discover Free WordPress Themes on the WordPress.com Theme Showcase.';
	} else if ( tier === 'premium' ) {
		return 'Discover Premium WordPress Themes on the WordPress.com Theme Showcase.';
	}

	return (
		'Beautiful, responsive, free and premium WordPress themes ' +
		'for your photography site, portfolio, magazine, business website, or blog.'
	);
}
