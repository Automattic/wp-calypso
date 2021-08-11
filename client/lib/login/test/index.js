/**
 * Internal dependencies
 */
import { pathWithLeadingSlash } from 'calypso/lib/login';

describe( 'pathWithLeadingSlash', () => {
	test( 'should add leading slash', () => {
		expect( pathWithLeadingSlash( 'foo' ) ).toEqual( '/foo' );
	} );

	test( 'should return path with a single leading slash', () => {
		expect( pathWithLeadingSlash( '///foo' ) ).toEqual( '/foo' );
	} );

	test( 'should return empty string if path is empty string', () => {
		expect( pathWithLeadingSlash( '' ) ).toEqual( '' );
	} );

	test( 'should return empty string for anything else', () => {
		const values = [ undefined, null, 123, 123n, true, false, Symbol(), {}, function () {} ];
		for ( const i in values ) {
			expect( pathWithLeadingSlash( values[ i ] ) ).toEqual( '' );
		}
	} );
} );
