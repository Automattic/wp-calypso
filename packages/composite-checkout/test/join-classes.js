/**
 * Internal dependencies
 */
import joinClasses from '../src/lib/join-classes';

describe( 'joinClasses', function () {
	it( 'returns an empty string when passed an empty array', function () {
		expect( joinClasses( [] ) ).toBe( '' );
	} );

	it( 'returns a single class when passed a singleton array', function () {
		expect( joinClasses( [ 'foo' ] ) ).toBe( 'foo' );
	} );

	it( 'returns two space-delimited classes when passed a doubleton array', function () {
		expect( joinClasses( [ 'foo', 'bar' ] ) ).toBe( 'foo bar' );
	} );

	it( 'converts numeric arguments to strings', function () {
		expect( joinClasses( [ 27, 0.1 ] ) ).toBe( '27 0.1' );
	} );
} );
