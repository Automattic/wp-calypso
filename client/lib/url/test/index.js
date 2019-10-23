/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { addSchemeIfMissing, setUrlScheme, resemblesUrl, omitUrlParams } from '../';

describe( 'addSchemeIfMissing()', () => {
	test( 'should add scheme if missing', () => {
		const source = 'example.com/path';
		const expected = 'https://example.com/path';

		const actual = addSchemeIfMissing( source, 'https' );

		expect( actual ).to.equal( expected );
	} );

	test( 'should skip if scheme exists', () => {
		const source = 'https://example.com/path';
		const expected = 'https://example.com/path';

		const actual = addSchemeIfMissing( source, 'https' );

		expect( actual ).to.equal( expected );
	} );
} );

describe( 'setUrlScheme()', () => {
	test( 'should skip if scheme already set', () => {
		const source = 'http://example.com/path';
		const expected = 'http://example.com/path';

		const actual = setUrlScheme( source, 'http' );

		expect( actual ).to.equal( expected );
	} );

	test( 'should add scheme if missing', () => {
		const source = 'example.com/path';
		const expected = 'http://example.com/path';

		const actual = setUrlScheme( source, 'http' );

		expect( actual ).to.equal( expected );
	} );

	test( 'should replace scheme if different', () => {
		const source = 'https://example.com/path';
		const expected = 'http://example.com/path';

		const actual = setUrlScheme( source, 'http' );

		expect( actual ).to.equal( expected );
	} );
} );

describe( 'resemblesUrl()', () => {
	test( 'should detect a URL', () => {
		const source = 'http://example.com/path';
		expect( resemblesUrl( source ) ).to.equal( true );
	} );

	test( 'should detect a URL without protocol', () => {
		const source = 'example.com';
		expect( resemblesUrl( source ) ).to.equal( true );
	} );

	test( 'should detect a URL with a query string', () => {
		const source = 'http://example.com/path?query=banana&query2=pineapple';
		expect( resemblesUrl( source ) ).to.equal( true );
	} );

	test( 'should detect a URL with a short suffix', () => {
		const source = 'http://example.cc';
		expect( resemblesUrl( source ) ).to.equal( true );
	} );

	test( 'should return false with adjacent dots', () => {
		const source = '..com';
		expect( resemblesUrl( source ) ).to.equal( false );
	} );

	test( 'should return false with spaced dots', () => {
		const source = '. . .com';
		expect( resemblesUrl( source ) ).to.equal( false );
	} );

	test( 'should return false with a single dot', () => {
		const source = '.';
		expect( resemblesUrl( source ) ).to.equal( false );
	} );

	test( 'should return false if the string is not a URL', () => {
		const source = 'exampledotcom';
		expect( resemblesUrl( source ) ).to.equal( false );
	} );
} );

describe( 'omitUrlParams()', () => {
	describe( 'when no URL is supplied', () => {
		test( 'should return null if the string is not a URL', () => {
			const actual = omitUrlParams();
			const expected = null;
			expect( actual ).to.equal( expected );
		} );
	} );

	describe( 'when a URL is supplied', () => {
		describe( 'when no omitting params are supplied', () => {
			test( 'should return the URL without modification', () => {
				const url = 'http://example.com/path?query=banana&query2=pineapple&query3=avocado';
				const actual = omitUrlParams( url );
				const expected = 'http://example.com/path?query=banana&query2=pineapple&query3=avocado';
				expect( actual ).to.equal( expected );
			} );
		} );

		describe( 'when a single omitting param is supplied as a string', () => {
			test( 'should return the URL with that param removed', () => {
				const url = 'http://example.com/path?query=banana&query2=pineapple&query3=avocado';
				const param = 'query2';
				const actual = omitUrlParams( url, param );
				const expected = 'http://example.com/path?query=banana&query3=avocado';
				expect( actual ).to.equal( expected );
			} );
		} );

		describe( 'when an array of omitting params is supplied', () => {
			test( 'should return the URL with each of those params removed', () => {
				const url = 'http://example.com/path?query=banana&query2=pineapple&query3=avocado';
				const params = [ 'query', 'query2' ];
				const actual = omitUrlParams( url, params );
				const expected = 'http://example.com/path?query3=avocado';
				expect( actual ).to.equal( expected );
			} );
		} );
	} );
} );
