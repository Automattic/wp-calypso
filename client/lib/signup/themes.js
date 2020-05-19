/**
 * External dependencies
 */

import { includes, sampleSize } from 'lodash';

/**
 * Internal dependencies
 */
import { themes } from 'lib/signup/themes-data';

function getUnusedThemes( themeSet, themePool, quantity ) {
	const themeSetSlugs = themeSet.map( ( theme ) => theme.slug );
	const filterBySlug = ( theme ) => ! includes( themeSetSlugs, theme.slug );
	const availableThemes = themePool.filter( filterBySlug );
	return sampleSize( availableThemes, quantity );
}

export function getDefaultThemes() {
	const filterByDefault = ( theme ) => theme.fallback;
	return themes.filter( filterByDefault );
}

export default function getThemes( vertical, designType, quantity = 9 ) {
	const filterByType = ( theme ) => {
		return Array.isArray( theme.design )
			? includes( theme.design, designType )
			: theme.design === designType;
	};
	const themePool = themes;
	const themesByType = themePool.filter( filterByType );
	let themeSet = themesByType;

	// We don't even have design type matches, so just use whatever default themes.
	if ( themeSet.length === 0 ) {
		return sampleSize( getDefaultThemes(), quantity );
	}

	// Make sure we meet the minimum number of themes by adding back in random design type matches.
	if ( themeSet.length < quantity ) {
		themeSet = themeSet.concat(
			getUnusedThemes( themeSet, themesByType, quantity - themeSet.length )
		);
	}

	return sampleSize( themeSet, quantity );
}
