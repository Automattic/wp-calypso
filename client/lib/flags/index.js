/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import GridiconGlobe from 'gridicons/dist/globe';

/**
 * Given a country code, return a flag SVG file path
 *
 * @param   {String} countryCode  A two-letter ISO_3166-1_country code
 * @returns {String}              Flag SVG file path
 */
export function flagUrl( countryCode ) {
	try {
		return require( `flag-icon-css/flags/4x3/${ countryCode }.svg` );
	} catch ( e ) {
		// As a fallback, return a 'globe' SVG.
		// Unfortunately, we're not shipping SVGs with the `gridicons` npm --
		// instead, they're inlined inside React components. The following code
		// is thus needed to produce the SVG from the component.
		// TODO: Ship SVGs with the `gridicons` npm, load the globe SVG directly.
		const gridicon = <GridiconGlobe size={ 24 } />;
		return 'data:image/svg+xml;utf8,' + renderToStaticMarkup( gridicon );
	}
}
