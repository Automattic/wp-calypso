/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import GridiconGlobe from 'gridicons/dist/globe';

/**
 * Internal dependencies
 */
import { flagUrl } from '..';

describe( 'flagUrl', () => {
	test( 'Given a valid country code, returns an SVG file path ', () => {
		// Note that the 'real' helper function returns a full path,
		// not just a filename plus extension. However, that behavior
		// relies on a webpack loader, which we can't fully emulate
		// in a testing context. The closest we can get to this behavior
		// uses a mock to return just a filename with extension, but no path.
		expect( flagUrl( 'us' ) ).toBe( 'us.svg' );
	} );

	test( 'Given an invalid country code, returns a fallback inline SVG ', () => {
		const gridicon = <GridiconGlobe size={ 24 } />;
		const globeSvg = 'data:image/svg+xml;utf8,' + renderToStaticMarkup( gridicon );

		// 'xk' stands for Kosovo, for which there is no flag SVG in the flag-icons-css npm (yet)
		expect( flagUrl( 'xk' ) ).toBe( globeSvg );
	} );
} );
