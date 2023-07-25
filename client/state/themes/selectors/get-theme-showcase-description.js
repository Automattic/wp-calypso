import { translate as translateFallback } from 'i18n-calypso';
import { get, includes } from 'lodash';
import { findThemeFilterTerm } from 'calypso/state/themes/selectors/find-theme-filter-term';
import { getThemeFilterTerm } from 'calypso/state/themes/selectors/get-theme-filter-term';

import 'calypso/state/themes/init';

export function getThemeShowcaseDescription(
	state,
	{ filter, tier, vertical } = {},
	translate = translateFallback
) {
	if ( vertical ) {
		const description = get( getThemeFilterTerm( state, 'subject', vertical ), 'description' );
		if ( description ) {
			return description;
		}

		/* translators: %(vertical)s will be replaced by a vertical name */
		return translate(
			'Discover %(vertical)s WordPress Themes on the WordPress.com Showcase. ' +
				'Here you can browse and find the best WordPress designs available on ' +
				'WordPress.com to discover the one that is just right for you.',
			{
				args: {
					vertical,
				},
			}
		);
	}

	// If we have *one* filter, use its description
	if ( filter && ! includes( filter, '+' ) ) {
		const filterDescription = get( findThemeFilterTerm( state, filter ), 'description' );
		if ( filterDescription ) {
			return filterDescription;
		}

		/* translators: %(filter)s will be replaced by a filter name, e.g. "Store", "Blog" */
		return translate(
			'Discover WordPress Themes supporting %(filter)s on the WordPress.com Showcase. ' +
				'Here you can browse and find the best WordPress designs available on ' +
				'WordPress.com to discover the one that is just right for you.',
			{
				args: {
					filter,
				},
			}
		);
	}

	if ( tier === 'free' ) {
		return translate( 'Discover Free WordPress Themes on the WordPress.com Theme Showcase.' );
	} else if ( tier === 'premium' ) {
		return translate( 'Discover Premium WordPress Themes on the WordPress.com Theme Showcase.' );
	}

	return translate(
		'Beautiful, responsive, free and premium WordPress themes ' +
			'for your photography site, portfolio, magazine, business website, or blog.'
	);
}
