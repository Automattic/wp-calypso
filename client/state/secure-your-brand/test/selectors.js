/**
 * Internal dependencies
 */
import {
	getSecureYourBrand,
	isRequestingSecureYourBrand,
	hasSecureYourBrandError,
} from '../selectors';
import { SECURE_YOUR_BRAND, getStateInstance } from './fixture';

describe( 'selectors', () => {
	describe( '#getSecureYourBrand()', () => {
		test( 'should return an object with Secure Your Brand upsell information', () => {
			const state = getStateInstance();
			const secureYourBrand = getSecureYourBrand( state );
			expect( secureYourBrand ).toEqual( SECURE_YOUR_BRAND );
		} );
	} );

	describe( '#isRequestingSecureYourBrand()', () => {
		test( 'should return requesting state of SecureYourBrand', () => {
			const state = getStateInstance();
			const isRequesting = isRequestingSecureYourBrand( state );
			expect( isRequesting ).toEqual( false );
		} );
	} );

	describe( '#hasSecureYourBrandError()', () => {
		test( 'should return false if no error', () => {
			const state = getStateInstance();
			const hasError = hasSecureYourBrandError( state );
			expect( hasError ).toEqual( false );
		} );
	} );
} );
