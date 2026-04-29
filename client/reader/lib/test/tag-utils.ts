import { slugify } from '../tag-utils';

describe( 'slugify', () => {
	it( 'lowercases and trims', () => {
		expect( slugify( '  Foo  ' ) ).toBe( 'foo' );
		expect( slugify( 'BAR' ) ).toBe( 'bar' );
	} );

	it( 'collapses whitespace into single dashes', () => {
		expect( slugify( 'foo bar baz' ) ).toBe( 'foo-bar-baz' );
		expect( slugify( 'foo   bar' ) ).toBe( 'foo-bar' );
		expect( slugify( 'foo--bar' ) ).toBe( 'foo-bar' );
		expect( slugify( 'foo - bar' ) ).toBe( 'foo-bar' );
	} );

	it( 'preserves non-ASCII characters without URL-encoding them', () => {
		// The api-core layer is responsible for URL-encoding path segments,
		// so slugify must hand over raw characters to avoid double-encoding.
		expect( slugify( '日本' ) ).toBe( '日本' );
		expect( slugify( 'Café' ) ).toBe( 'café' );
		expect( slugify( '🐙' ) ).toBe( '🐙' );
	} );

	it( 'preserves non-letter ASCII characters', () => {
		expect( slugify( 'c++' ) ).toBe( 'c++' );
		expect( slugify( 'foo&bar' ) ).toBe( 'foo&bar' );
	} );

	it( 'returns an empty string for non-string input', () => {
		// @ts-expect-error – exercising defensive runtime branch
		expect( slugify( null ) ).toBe( '' );
		// @ts-expect-error – exercising defensive runtime branch
		expect( slugify( undefined ) ).toBe( '' );
		// @ts-expect-error – exercising defensive runtime branch
		expect( slugify( 42 ) ).toBe( '' );
	} );
} );
