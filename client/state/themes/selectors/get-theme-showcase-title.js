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

export function getThemeShowcaseTitle( state, { filter, tier, vertical } = {} ) {
	if ( vertical ) {
		const name = get( getThemeFilterTerm( state, 'subject', vertical ), 'name' );
		if ( name ) {
			return `${ name } WordPress Themes`;
		}
	}

	// If we have *one* filter, use its name
	if ( filter && ! includes( filter, '+' ) ) {
		const filterName = get( findThemeFilterTerm( state, filter ), 'name' );
		if ( filterName ) {
			return `${ filterName } WordPress Themes`;
		}
	}

	if ( tier === 'free' ) {
		return 'Free WordPress Themes';
	} else if ( tier === 'premium' ) {
		return 'Premium WordPress Themes';
	}

	return 'WordPress Themes';
}
