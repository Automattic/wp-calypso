/**
 * @jest-environment jsdom
 */
import { getTagPath, getTagTitle } from '../utils';

jest.mock( '@automattic/i18n-utils', () => ( {
	addLocaleToPathLocaleInFront: ( path: string ) => path,
} ) );

describe( 'getTagPath', () => {
	it( 'does not double-encode slugs that arrive percent-encoded', () => {
		expect( getTagPath( 'b%c3%a4ume' ) ).toBe( '/tag/b%C3%A4ume' );
	} );

	it( 'encodes raw slugs', () => {
		expect( getTagPath( 'bäume' ) ).toBe( '/tag/b%C3%A4ume' );
		expect( getTagPath( 'photography' ) ).toBe( '/tag/photography' );
	} );

	it( 'keeps slugs with a stray percent sign', () => {
		expect( getTagPath( '100%' ) ).toBe( '/tag/100%25' );
	} );
} );

describe( 'getTagTitle', () => {
	it( 'decodes HTML entities in titles', () => {
		expect( getTagTitle( { slug: 'b%c3%bcro', title: '&#98;&#252;&#114;&#111;' } ) ).toBe( 'büro' );
	} );

	it( 'falls back to the slug when the title lost its non-ASCII characters', () => {
		expect( getTagTitle( { slug: 'b%c3%a4ume', title: 'b??ume' } ) ).toBe( 'bäume' );
	} );

	it( 'keeps titles that are already correct', () => {
		expect( getTagTitle( { slug: 'fu%c3%9fball', title: 'FUẞBALL' } ) ).toBe( 'FUẞBALL' );
		expect( getTagTitle( { slug: 'what', title: 'What?' } ) ).toBe( 'What?' );
	} );
} );
