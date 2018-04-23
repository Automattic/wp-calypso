/** @format */

/**
 * Internal dependencies
 */
import reducer from '../reducer';

describe( 'reducer', () => {
	const state = reducer( undefined, {} );

	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'backPath', 'themesBannerVisible' ] )
		);
	} );

	test( 'should default to a backPath of /themes', () => {
		expect( state.backPath ).toBe( '/themes' );
	} );

	test( 'should default to a themesBannerVisible of true', () => {
		expect( state.themesBannerVisible ).toBe( true );
	} );
} );
