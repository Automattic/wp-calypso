/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import resolveRelativePath from '../resolve-relative-path';

describe( 'resolveRelativePath()', () => {
	test( 'should return `/` when both parameters are omitted', () => {
		expect( resolveRelativePath( undefined, undefined ) ).toBe( '/' );
	} );

	test( 'should return the base path when the relative path is omitted', () => {
		expect( resolveRelativePath( '/foo', undefined ) ).toBe( '/foo' );
	} );

	test( 'should handle relative paths with `.`', () => {
		expect( resolveRelativePath( '/foo', '.' ) ).toBe( '/foo/' );
		expect( resolveRelativePath( '/foo/bar', '.' ) ).toBe( '/foo/bar/' );
	} );

	test( 'should handle relative paths with `..`', () => {
		expect( resolveRelativePath( '/foo/bar/baz', '..' ) ).toBe( '/foo/bar/' );
		expect( resolveRelativePath( '/foo/bar/baz', '../..' ) ).toBe( '/foo/' );
		expect( resolveRelativePath( '/foo/bar/baz', '../biz' ) ).toBe( '/foo/bar/biz' );
	} );

	test( 'should handle relative paths with `..` when they go past the root', () => {
		expect( resolveRelativePath( '/foo/bar/baz', '../../../../..' ) ).toBe( '/' );
		expect( resolveRelativePath( '/foo/bar/baz', '../../../../../biz' ) ).toBe( '/biz' );
	} );
} );
