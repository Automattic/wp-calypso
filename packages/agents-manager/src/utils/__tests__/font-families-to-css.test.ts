/**
 * @jest-environment jsdom
 */
import { fontFamiliesToCSS } from '../font-families-to-css';

describe( 'fontFamiliesToCSS', () => {
	afterEach( () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		delete ( window as any ).wp;
	} );

	it( 'generates `@font-face` CSS for font families with `fontFace`', () => {
		const css = fontFamiliesToCSS( [
			{
				name: 'Test Font',
				fontFamily: '"Test Font", sans-serif',
				fontFace: [
					{
						fontFamily: 'Test Font',
						fontWeight: '400',
						fontStyle: 'normal',
						src: [ 'url/to/font.woff2' ],
					},
				],
			},
		] );

		expect( css ).toContain( '@font-face' );
		expect( css ).toContain( 'font-family: "Test Font"' );
		expect( css ).toContain( 'font-weight: 400' );
		expect( css ).toContain( 'src: url("url/to/font.woff2")' );
		expect( css ).toContain( 'font-display: block' );
	} );

	it( 'resolves `file:` theme font src to a theme URL', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( window as any ).wp = {
			data: {
				select: () => ( {
					getCurrentTheme: () => ( { stylesheet: 'pub/assembler' } ),
				} ),
			},
		};

		const css = fontFamiliesToCSS( [
			{
				name: 'Ibarra Real Nova',
				fontFamily: '"Ibarra Real Nova", serif',
				fontFace: [
					{
						fontFamily: 'Ibarra Real Nova',
						fontWeight: '100 800',
						fontStyle: 'normal',
						src: [ 'file:./assets/fonts/ibarra-real-nova/IbarraRealNova-VariableFont_wght.woff2' ],
					},
				],
			},
		] );

		expect( css ).toContain( '@font-face' );
		expect( css ).toContain( 'font-family: "Ibarra Real Nova"' );
		expect( css ).toContain(
			'/wp-content/themes/pub/assembler/assets/fonts/ibarra-real-nova/IbarraRealNova-VariableFont_wght.woff2'
		);
	} );

	it( 'handles `stylesheetUri` objects (raw/rendered) and strips style.css', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( window as any ).wp = {
			data: {
				select: () => ( {
					getCurrentTheme: () => ( {
						stylesheetUri: {
							raw: 'https://example.com/wp-content/themes/pub/assembler/style.css',
						},
					} ),
				} ),
			},
		};

		const css = fontFamiliesToCSS( [
			{
				name: 'Fraunces',
				fontFamily: '"Fraunces", serif',
				fontFace: [
					{
						fontFamily: 'Fraunces',
						fontWeight: '100 900',
						fontStyle: 'normal',
						src: [ 'file:./assets/fonts/fraunces/Fraunces-Italic-VariableFont.woff2' ],
					},
				],
			},
		] );

		expect( css ).toContain(
			'https://example.com/wp-content/themes/pub/assembler/assets/fonts/fraunces/Fraunces-Italic-VariableFont.woff2'
		);
	} );

	it( 'prefers same-origin wp-content theme base over cross-origin theme URIs', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( window as any ).wp = {
			data: {
				select: () => ( {
					getCurrentTheme: () => ( {
						stylesheet: 'assembler',
						stylesheetUri: {
							raw: 'https://wordpress.com/themes/assembler/style.css',
						},
					} ),
				} ),
			},
		};

		const css = fontFamiliesToCSS( [
			{
				name: 'Inter',
				fontFamily: '"Inter", sans-serif',
				fontFace: [
					{
						fontFamily: 'Inter',
						fontWeight: '100 900',
						fontStyle: 'normal',
						src: [ 'file:./assets/fonts/inter/InterVariable.woff2' ],
					},
				],
			},
		] );

		expect( css ).toContain(
			'/wp-content/themes/assembler/assets/fonts/inter/InterVariable.woff2'
		);
		expect( css ).not.toContain( 'wordpress.com/themes/assembler' );
	} );

	it( 'returns empty string for empty font families', () => {
		expect( fontFamiliesToCSS( [] ) ).toBe( '' );
	} );

	it( 'returns empty string for font families without `fontFace`', () => {
		const css = fontFamiliesToCSS( [
			{ name: 'Test Font', fontFamily: '"Test Font", sans-serif' },
		] );
		expect( css ).toBe( '' );
	} );
} );
