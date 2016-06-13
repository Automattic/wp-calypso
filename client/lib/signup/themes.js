/**
 * External dependencies
 */
import shuffle from 'lodash/shuffle';

/**
 * Internal dependencies
 */
import { themes } from 'lib/signup/themes-data';

export function getDefaultThemes() {
	const filterByDefault = theme => theme.fallback;
	return themes.filter( filterByDefault );
}

export default function getThemes( vertical, designType ) {
	const filterByType = theme => theme.design === designType;
	//const filterByVertical = theme => includes( theme.verticals, vertical );

	// Filter only by design type until verticals pass testing.
	let themeSet = themes.filter( filterByType );

	if ( 0 === themeSet.length ) {
		themeSet = getDefaultThemes();
	}

	return shuffle( themeSet );
}
