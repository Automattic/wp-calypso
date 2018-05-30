/** @format */

/**
 * Internal dependencies
 */
import reducer, { backPath, themesBannerVisible } from '../reducer';
import { SERIALIZE, DESERIALIZE } from 'state/action-types';

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
	test( 'should default to a themesBannerVisible of true', () => {
		const state = themesBannerVisible( undefined, {} );

		expect( state ).toBe( true );
	} );

	test( 'persists visible state', () => {
		const state = themesBannerVisible( true, {
			type: SERIALIZE,
		} );

		expect( state ).toBe( true );
	} );

	test( 'persists invisible state', () => {
		const state = themesBannerVisible( false, {
			type: SERIALIZE,
		} );

		expect( state ).toBe( false );
	} );

	test( 'loads persisted visible state', () => {
		const state = themesBannerVisible( true, {
			type: DESERIALIZE,
		} );

		expect( state ).toBe( true );
	} );

	test( 'loads persisted invisible state', () => {
		const state = themesBannerVisible( false, {
			type: DESERIALIZE,
		} );

		expect( state ).toBe( false );
	} );

	test( "doesn't load invalid persisted state", () => {
		jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
		const state = themesBannerVisible( 'wtf', {
			type: DESERIALIZE,
		} );

		expect( state ).toBe( true ); // Falls back to `initialState`, which is `true`.
	} );
} );
