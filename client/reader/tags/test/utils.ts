/**
 * @jest-environment jsdom
 */
import { getTagPath, getTagTitle, recoverTagTitle } from '../utils';

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

	it( 'keeps encoded reserved characters escaped for the tag route', () => {
		expect( getTagPath( '100%25' ) ).toBe( '/tag/100%2525' );
		expect( getTagPath( 'a%2fb' ) ).toBe( '/tag/a%252fb' );
	} );
} );

describe( 'getTagTitle', () => {
	it( 'decodes HTML entities in titles', () => {
		expect( getTagTitle( { slug: 'b%c3%bcro', title: '&#98;&#252;&#114;&#111;' } ) ).toBe( 'büro' );
	} );

	it( 'falls back to the slug when the title lost its non-ASCII characters', () => {
		expect( getTagTitle( { slug: 'b%c3%a4ume', title: 'b??ume' } ) ).toBe( 'bäume' );
		expect( getTagTitle( { slug: 'm%c3%a9t%c3%a9o', title: 'Mto' } ) ).toBe( 'météo' );
	} );

	it( 'falls back to the slug when the title is cut off mid-entity', () => {
		expect( getTagTitle( { slug: 'verst%c3%a4ndnis', title: 'Verst&#228;ndn&amp;' } ) ).toBe(
			'verständnis'
		);
	} );

	it( 'keeps titles that are already correct', () => {
		expect( getTagTitle( { slug: 'fu%c3%9fball', title: 'FUẞBALL' } ) ).toBe( 'FUẞBALL' );
		expect( getTagTitle( { slug: 'caf%c3%a9-kultur', title: 'Café Kultur?' } ) ).toBe(
			'Café Kultur?'
		);
		expect( getTagTitle( { slug: 'what', title: 'What?' } ) ).toBe( 'What?' );
	} );
} );

describe( 'recoverTagTitle', () => {
	it( 'does not decode entities a second time', () => {
		expect( recoverTagTitle( 'art', 'Art &copywriting' ) ).toBe( 'Art &copywriting' );
	} );
} );
