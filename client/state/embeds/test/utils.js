/**
 * Internal dependencies
 */
import { normalizeEmbeds } from '../utils';

describe( 'normalizeEmbeds', () => {
	test( 'should escape forward slashes properly', () => {
		const source = [ 'http://example.com/*' ];
		const expected = [ /http:\/\/example.com\/*/ ];
		expect( normalizeEmbeds( source ) ).toEqual( expected );
	} );

	test( 'should recognize and preserve forward slash delimiters', () => {
		const source = [ '/http://example.com/*/' ];
		const expected = [ /http:\/\/example.com\/*/ ];
		expect( normalizeEmbeds( source ) ).toEqual( expected );
	} );

	test( 'should consider alternative delimiters', () => {
		const source = [ '#http://example.com/*#' ];
		const expected = [ /http:\/\/example.com\/*/ ];
		expect( normalizeEmbeds( source ) ).toEqual( expected );
	} );

	test( 'should preserve correct modifiers', () => {
		const source = [ '/http://example.com/*/i' ];
		const expected = [ /http:\/\/example.com\/*/i ];
		expect( normalizeEmbeds( source ) ).toEqual( expected );
	} );
} );
