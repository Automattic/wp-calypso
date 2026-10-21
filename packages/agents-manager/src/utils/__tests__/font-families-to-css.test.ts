/**
 * @jest-environment jsdom
 */
import { fontFamiliesToCSS, injectFontFamiliesIntoEditorIframe } from '../font-families-to-css';

const mockGetCurrentTheme = jest.fn();
jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( {
	select: () => ( { getCurrentTheme: mockGetCurrentTheme } ),
} ) );

describe( 'fontFamiliesToCSS', () => {
	beforeEach( () => jest.clearAllMocks() );

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
		mockGetCurrentTheme.mockReturnValue( { stylesheet: 'pub/assembler' } );

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
		mockGetCurrentTheme.mockReturnValue( {
			stylesheetUri: {
				raw: 'https://example.com/wp-content/themes/pub/assembler/style.css',
			},
		} );

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
		mockGetCurrentTheme.mockReturnValue( {
			stylesheet: 'assembler',
			stylesheetUri: {
				raw: 'https://wordpress.com/themes/assembler/style.css',
			},
		} );

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

	it( 'strips CSS-breaking characters and drops unknown descriptors', () => {
		const css = fontFamiliesToCSS( [
			{
				name: 'Evil',
				fontFamily: '"Evil", serif',
				fontFace: [
					{
						fontFamily: 'Evil',
						fontWeight: '400 } body { display:none } @font-face { font-weight: 400',
						notADescriptor: 'x',
						src: [ 'x") } body { background: red } @font-face { src: url("y' ],
					},
				],
			},
		] );

		// One rule only — nothing escapes the `@font-face` block.
		expect( css.match( /{/g ) ).toHaveLength( 1 );
		expect( css.match( /}/g ) ).toHaveLength( 1 );
		expect( css ).not.toContain( 'not-a-descriptor' );
	} );

	it( 'drops font sources with disallowed URL schemes', () => {
		const css = fontFamiliesToCSS( [
			{
				name: 'Sneaky',
				fontFamily: '"Sneaky", serif',
				fontFace: [ { fontFamily: 'Sneaky', src: [ 'javascript:alert(1)' ] } ],
			},
		] );

		expect( css ).toBe( '' );
	} );

	it( 'ignores malformed entries without throwing', () => {
		const css = fontFamiliesToCSS( [
			null,
			{ name: 'No Faces', fontFamily: '"No Faces", serif', fontFace: {} },
			{ name: 'Null Face', fontFamily: '"Null Face", serif', fontFace: [ null ] },
		] as unknown as Parameters< typeof fontFamiliesToCSS >[ 0 ] );

		expect( css ).toBe( '' );
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

describe( 'injectFontFamiliesIntoEditorIframe', () => {
	const families = [
		{
			name: 'Inter',
			fontFamily: '"Inter", sans-serif',
			fontFace: [ { fontFamily: 'Inter', src: [ 'https://example.com/inter.woff2' ] } ],
		},
	];

	beforeEach( () => {
		jest.clearAllMocks();
		document.body.innerHTML = '<iframe name="editor-canvas"></iframe>';
	} );

	it( 'reuses one style element and does not duplicate CSS across calls', () => {
		injectFontFamiliesIntoEditorIframe( families );
		injectFontFamiliesIntoEditorIframe( families );

		const canvasDocument =
			document.querySelector< HTMLIFrameElement >( '[name="editor-canvas"]' )!.contentDocument!;
		const styles = canvasDocument.querySelectorAll( 'style' );

		expect( styles ).toHaveLength( 1 );
		expect( styles[ 0 ].textContent?.match( /@font-face/g ) ).toHaveLength( 1 );
	} );
} );
