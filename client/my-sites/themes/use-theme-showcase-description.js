import { useTranslate } from 'i18n-calypso';
import { get, includes } from 'lodash';
import { useSelector } from 'react-redux';
import { findThemeFilterTerm } from 'calypso/state/themes/selectors/find-theme-filter-term';
import { getThemeFilterTerm } from 'calypso/state/themes/selectors/get-theme-filter-term';

export default function useThemeShowcaseDescription( { filter, tier, vertical } = {} ) {
	const translate = useTranslate();
	const description = useSelector( ( state ) => {
		if ( vertical ) {
			return get( getThemeFilterTerm( state, 'subject', vertical ), 'description' );
		}
	} );
	const filterDescription = useSelector( ( state ) => {
		// If we have *one* filter, use its description
		if ( filter && ! includes( filter, '+' ) ) {
			return get( findThemeFilterTerm( state, filter ), 'description' );
		}
	} );

	if ( vertical ) {
		if ( description ) {
			return description;
		}

		/* translators: %(vertical)s will be replaced by a vertical name, e.g. "Business", "Portfolio" */
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
