/**
 * Internal dependencies
 */
import { CHECKOUT_TOGGLE_CART_ON_MOBILE } from 'state/action-types';
import reducer, { isShowingCartOnMobile } from '../reducer';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual( [ 'isShowingCartOnMobile' ] );
	} );

	describe( '#isShowingCartOnMobile', () => {
		test( 'should default to false', () => {
			const state = isShowingCartOnMobile( undefined, {} );
			expect( state ).toBeFalse;
		} );

		test( 'should be true after toggle when false', () => {
			const state = isShowingCartOnMobile( false, { type: CHECKOUT_TOGGLE_CART_ON_MOBILE } );
			expect( state ).toBeTrue;
		} );

		test( 'should be false after toggle when true', () => {
			const state = isShowingCartOnMobile( true, { type: CHECKOUT_TOGGLE_CART_ON_MOBILE } );
			expect( state ).toBeFalse;
		} );

		test( 'should be unchanged after other action', () => {
			const state = isShowingCartOnMobile( true, { type: 'WRONSKI_FEINT' } );
			expect( state ).toBeTrue;
		} );
	} );
} );
