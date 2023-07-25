import { translate as translateFallback } from 'i18n-calypso';
import { get, includes } from 'lodash';
import { findThemeFilterTerm } from 'calypso/state/themes/selectors/find-theme-filter-term';
import { getThemeFilterTerm } from 'calypso/state/themes/selectors/get-theme-filter-term';

import 'calypso/state/themes/init';

export function getThemeShowcaseTitle(
	state,
	{ filter, tier, vertical } = {},
	translate = translateFallback
) {
	if ( vertical ) {
		const verticalName = get( getThemeFilterTerm( state, 'subject', vertical ), 'name' );
		if ( verticalName ) {
			/* translators: %(verticalName)s will be replaced by a vertical name */
			return translate( '%(verticalName)s WordPress Themes', {
				args: {
					verticalName,
				},
			} );
		}
	}

	// If we have *one* filter, use its name
	if ( filter && ! includes( filter, '+' ) ) {
		const filterName = get( findThemeFilterTerm( state, filter ), 'name' );
		if ( filterName ) {
			/* translators: %(filterName)s will be replaced by a filter name, e.g. "Store", "Blog" */
			return translate( '%(filterName)s WordPress Themes', {
				args: {
					filterName,
				},
			} );
		}
	}

	if ( tier === 'free' ) {
		return translate( 'Free WordPress Themes' );
	} else if ( tier === 'premium' ) {
		return translate( 'Premium WordPress Themes' );
	}

	return translate( 'WordPress Themes' );
}
