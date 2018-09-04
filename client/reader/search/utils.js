/** @format */
/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';

export function getSearchPlaceholderText() {
	const selectedPlaceholder = abtest( 'readerSearchPlaceholder' );

	let placeholderText = i18n.translate( 'Search' );

	switch ( selectedPlaceholder ) {
		case 'nextGreatRead':
			placeholderText = i18n.translate( 'Search for your next great read' );
			break;

		case 'newFavorite':
			placeholderText = i18n.translate( 'Search for your new favorite site' );
			break;
	}

	return placeholderText;
}
