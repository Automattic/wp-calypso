/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { getImmediateLoginReason, wasImmediateLoginUsed } from '../selectors';

describe( 'immediate-login/reducer', () => {
	describe( 'wasImmediateLoginUsed', () => {
		test( 'should return correct value from state [1]', () => {
			expect( getImmediateLoginReason( {} ) ).toEqual( null );
		} );

		test( 'should return correct value from state [2]', () => {
			expect( getImmediateLoginReason( { immediateLogin: { reason: 'test reason' } } ) ).toEqual(
				'test reason'
			);
		} );
	} );

	describe( 'getImmediateLoginReason', () => {
		test( 'should return correct value from state [1]', () => {
			expect( wasImmediateLoginUsed( {} ) ).toEqual( false );
		} );

		test( 'should return correct value from state [2]', () => {
			expect( wasImmediateLoginUsed( { immediateLogin: { used: false } } ) ).toEqual( false );
		} );

		test( 'should return correct value from state [3]', () => {
			expect( wasImmediateLoginUsed( { immediateLogin: { used: true } } ) ).toEqual( true );
		} );
	} );
} );
