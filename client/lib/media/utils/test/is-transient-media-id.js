/**
 * Internal dependencies
 */
import isTransientMediaId from '../is-transient-media-id';

describe( 'isTransientMediaId()', () => {
	test( 'should return true if given string is a valid transient media id', () => {
		expect( isTransientMediaId( 'media-f293j02' ) ).toBe( true );
		expect( isTransientMediaId( 'media-enhanced-prefix-f293j02' ) ).toBe( true );
	} );

	test( 'should return false if given string is not a valid transient media id', () => {
		expect( isTransientMediaId( 'f293j02' ) ).toBe( false );
		expect( isTransientMediaId( 3279878932 ) ).toBe( false );
	} );
} );
