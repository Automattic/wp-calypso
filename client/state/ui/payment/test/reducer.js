/** @format */

/**
 * Internal dependencies
 */
import { countryCode } from '../reducer';
import { PAYMENT_COUNTRY_CODE_SET } from 'state/action-types';

describe( 'reducer', () => {
	describe( 'countryCode', () => {
		test( 'should return null by default', () => {
			const state = undefined;
			const action = {};
			expect( countryCode( state, action ) ).toBeNull();
		} );

		test( 'should return previous country code if the action is empty', () => {
			const state = 'US';
			const action = {};
			expect( countryCode( state, action ) ).toEqual( 'US' );
		} );

		test( 'should return new country code if the action provides a country code', () => {
			const state = 'US';
			const action = { type: PAYMENT_COUNTRY_CODE_SET, countryCode: 'AR' };
			expect( countryCode( state, action ) ).toEqual( 'AR' );
		} );
	} );
} );
