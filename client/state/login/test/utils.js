import { isPartnerSignupQuery } from '../utils';

describe( 'isPartnerSignupQuery', () => {
	it( 'should return false when currentQuery is undefined', () => {
		const result = isPartnerSignupQuery( undefined );
		expect( result ).toBe( false );
	} );

	it( 'should return false when currentQuery is null', () => {
		const result = isPartnerSignupQuery( null );
		expect( result ).toBe( false );
	} );

	it( 'should return true when currentQuery has is_partner_signup', () => {
		const currentQuery = { is_partner_signup: true };
		const result = isPartnerSignupQuery( currentQuery );
		expect( result ).toBe( true );
	} );

	it( 'should return true when currentQuery has redirect_to with partner-signup', () => {
		const currentQuery = { redirect_to: 'https://woocommerce.com/partner-signup' };
		const result = isPartnerSignupQuery( currentQuery );
		expect( result ).toBe( true );
	} );

	it( 'should return true when currentQuery has oauth2_redirect with partner-signup', () => {
		const currentQuery = { oauth2_redirect: 'https://woocommerce.com/partner-signup' };
		const result = isPartnerSignupQuery( currentQuery );
		expect( result ).toBe( true );
	} );

	it( 'should throw an error when an unexpected error occurs', () => {
		const currentQuery = { redirect_to: 'https://woocommerce.com/partner-signup' };
		const originalDecodeURIComponent = global.decodeURIComponent;
		global.decodeURIComponent = jest.fn( () => {
			throw new Error( 'Unexpected error' );
		} );

		expect( () => isPartnerSignupQuery( currentQuery ) ).toThrow( 'Unexpected error' );

		// Restore the original decodeURIComponent function
		global.decodeURIComponent = originalDecodeURIComponent;
	} );
} );
