/** @format */

/**
 * Internal dependencies
 */
import reducer, { backPath, themesBannerVisible } from '../reducer';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'backPath', 'themesBannerVisible' ] )
		);
	} );
} );

describe( '#backPath', () => {
	const state = backPath( undefined, {} );

	test( 'should default to a backPath of /themes', () => {
		expect( state ).toBe( '/themes' );
	} );
} );

describe( '#themesBannerVisible', () => {
	const state = themesBannerVisible( undefined, {} );

	test( 'should default to a themesBannerVisible of true', () => {
		expect( state ).toBe( true );
	} );
} );
