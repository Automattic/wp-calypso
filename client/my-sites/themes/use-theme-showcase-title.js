import { useTranslate } from 'i18n-calypso';
import { get, includes } from 'lodash';
import { useSelector } from 'react-redux';
import { findThemeFilterTerm } from 'calypso/state/themes/selectors/find-theme-filter-term';
import { getThemeFilterTerm } from 'calypso/state/themes/selectors/get-theme-filter-term';

export default function useThemeShowcaseTitle( { filter, tier, vertical } = {} ) {
	const translate = useTranslate();

	const verticalName = useSelector( ( state ) => {
		if ( vertical ) {
			return get( getThemeFilterTerm( state, 'subject', vertical ), 'name' );
		}
	} );

	// If we have *one* filter, use its name
	const filterName = useSelector( ( state ) => {
		if ( filter && ! includes( filter, '+' ) ) {
			return get( findThemeFilterTerm( state, filter ), 'name' );
		}
	} );

	if ( verticalName ) {
		/* translators: %(verticalName)s will be replaced by a vertical name, e.g. "Business", "Portfolio" */
		return translate( '%(verticalName)s WordPress Themes', {
			args: {
				verticalName,
			},
		} );
	}

	if ( filterName ) {
		/* translators: %(filterName)s will be replaced by a filter name, e.g. "Store", "Blog" */
		return translate( '%(filterName)s WordPress Themes', {
			args: {
				filterName,
			},
		} );
	}

	if ( tier === 'free' ) {
		return translate( 'Free WordPress Themes' );
	} else if ( tier === 'premium' ) {
		return translate( 'Premium WordPress Themes' );
	}

	return translate( 'WordPress Themes' );
}
