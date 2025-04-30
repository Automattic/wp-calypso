/**
 * @jest-environment jsdom
 */
import { isPlanSufficient } from '../unified-design-picker-preview';

describe( 'isPlanSufficient', () => {
	it( 'should return true if the required plan is "free"', () => {
		expect( isPlanSufficient( 'free', 'personal' ) ).toBe( true );
		expect( isPlanSufficient( 'free', 'business' ) ).toBe( true );
		expect( isPlanSufficient( 'free', 'ecommerce' ) ).toBe( true );
	} );

	it( 'should return true if the site plan matches the required plan', () => {
		expect( isPlanSufficient( 'personal', 'personal' ) ).toBe( true );
		expect( isPlanSufficient( 'business', 'business' ) ).toBe( true );
		expect( isPlanSufficient( 'ecommerce', 'ecommerce' ) ).toBe( true );
	} );

	it( 'should return true if the site plan is higher than the required plan', () => {
		expect( isPlanSufficient( 'personal', 'value' ) ).toBe( true );
		expect( isPlanSufficient( 'personal', 'business' ) ).toBe( true );
		expect( isPlanSufficient( 'personal', 'ecommerce' ) ).toBe( true );
		expect( isPlanSufficient( 'value', 'business' ) ).toBe( true );
		expect( isPlanSufficient( 'value', 'ecommerce' ) ).toBe( true );
		expect( isPlanSufficient( 'business', 'ecommerce' ) ).toBe( true );
	} );

	it( 'should return false if the site plan is lower than the required plan', () => {
		expect( isPlanSufficient( 'business', 'personal' ) ).toBe( false );
		expect( isPlanSufficient( 'ecommerce', 'business' ) ).toBe( false );
		expect( isPlanSufficient( 'value', 'personal' ) ).toBe( false );
	} );

	it( 'should return false if the required plan is not recognized', () => {
		expect( isPlanSufficient( 'unknown', 'personal' ) ).toBe( false );
		expect( isPlanSufficient( 'unknown', 'business' ) ).toBe( false );
	} );

	it( 'should handle undefined or empty inputs gracefully', () => {
		expect( isPlanSufficient( undefined, 'personal' ) ).toBe( false );
		expect( isPlanSufficient( 'personal', undefined ) ).toBe( false );
		expect( isPlanSufficient( '', 'personal' ) ).toBe( false );
		expect( isPlanSufficient( 'personal', '' ) ).toBe( false );
	} );
} );
