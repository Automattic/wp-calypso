/**
 * @jest-environment node
 */
import { readFileSync } from 'fs';
import { DOTCOM_DASHBOARD_SECTION_DEFINITION } from '../section';

describe( 'DOTCOM_DASHBOARD_SECTION_DEFINITION', () => {
	// The dashboard preloads Recoleta to avoid a heading FOUT. That preload only
	// pays off while its URL matches the font the stylesheet actually requests; a
	// stale preload silently downloads bytes nothing uses. The canonical URL lives
	// in the `@font-face` rule in `@automattic/typography`, so guard against drift.
	it( 'only preloads font URLs that are declared in @automattic/typography', () => {
		// `@automattic/typography`'s `main` resolves directly to its fonts stylesheet.
		const fontsScss = readFileSync( require.resolve( '@automattic/typography' ), 'utf8' );
		const declaredFontUrls = [ ...fontsScss.matchAll( /url\(\s*([^)\s]+)\s*\)/g ) ].map(
			( match ) => match[ 1 ].replace( /['"]/g, '' )
		);
		expect( declaredFontUrls.length ).toBeGreaterThan( 0 );

		const fontPreloads = DOTCOM_DASHBOARD_SECTION_DEFINITION.links.filter(
			( link ) => link.rel === 'preload'
		);
		expect( fontPreloads.length ).toBeGreaterThan( 0 );

		for ( const preload of fontPreloads ) {
			expect( declaredFontUrls ).toContain( preload.href );
		}
	} );
} );
