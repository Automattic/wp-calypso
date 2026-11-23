/**
 * @vitest-environment jsdom
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { ThemePrePaint, colorSchemeStorageKey } from '../theme-pre-paint';

function runPrePaint( userId?: number ) {
	const markup = renderToStaticMarkup( <ThemePrePaint userId={ userId } /> );
	const script = markup.match( /<script[^>]*>([\s\S]*)<\/script>/ )?.[ 1 ];
	if ( script ) {
		new Function( script )();
	}
	return document.documentElement.dataset.prePaintTheme;
}

describe( 'ThemePrePaint', () => {
	beforeEach( () => {
		window.localStorage.clear();
		delete document.documentElement.dataset.prePaintTheme;
	} );

	test( 'paints dark for the user who last saw dark mode', () => {
		window.localStorage.setItem( colorSchemeStorageKey( 1 ), 'dark' );
		expect( runPrePaint( 1 ) ).toBe( 'dark' );
	} );

	test( 'does not paint dark for another account signed in on the same browser', () => {
		window.localStorage.setItem( colorSchemeStorageKey( 1 ), 'dark' );
		expect( runPrePaint( 2 ) ).toBeUndefined();
	} );
} );
