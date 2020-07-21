/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { validateBrazilianTIN } from '../payment-methods/credit-card/credit-card-pay-button';

describe( 'validateBrazilianTIN', () => {
	it( 'does not accept the empty string', () => {
		expect( validateBrazilianTIN( '' ) ).not.toBe( '' );
	} );

	it( 'accepts correctly formatted CPFs', () => {
		expect( validateBrazilianTIN( '000.000.000-00' ) ).toBe( '' );
		expect( validateBrazilianTIN( '123.456.789-01' ) ).toBe( '' );
	} );

	it( 'accepts correctly formatted CNPJs', () => {
		expect( validateBrazilianTIN( '00.000.000/0000-00' ) ).toBe( '' );
		expect( validateBrazilianTIN( '12.345.678/9012-34' ) ).toBe( '' );
	} );

	it( 'does not accept correctly formatted CPFs with letters substituted', () => {
		expect( validateBrazilianTIN( '000.x00.000-00' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '123.456.78A-01' ) ).not.toBe( '' );
	} );

	it( 'does not accept correctly formatted CNPJs with letters substituted', () => {
		expect( validateBrazilianTIN( '0x.000.000/0000-00' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '12.345.678/9012-A4' ) ).not.toBe( '' );
	} );

	it( 'does not accept incorrectly formatted CPFs', () => {
		expect( validateBrazilianTIN( '00000000000' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '12345678001' ) ).not.toBe( '' );
	} );

	it( 'does not accept incorrectly formatted CNPJs', () => {
		expect( validateBrazilianTIN( '00000000000000' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '12345678901234' ) ).not.toBe( '' );
	} );

	it( 'does not accept innocent mistakes', () => {
		expect( validateBrazilianTIN( '000,000.000-00' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '000.000.000-0' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '000.000.000-000' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '0000.000.000-00' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '00.000,000/0000-00' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '00.000.000-0000-00' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '00.000.000/0000-000' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '000.000.000/0000-00' ) ).not.toBe( '' );
	} );

	it( 'does not accept malicious mistakes', () => {
		expect( validateBrazilianTIN( '０００.０００.０００-００' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '𝟎𝟎𝟎.𝟎𝟎𝟎.𝟎𝟎𝟎-𝟎𝟎' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '𝟘𝟘𝟘.𝟘𝟘𝟘.𝟘𝟘𝟘-𝟘𝟘' ) ).not.toBe( '' );
	} );

	it( 'does not accept garbage', () => {
		expect( validateBrazilianTIN( 'all your base are belong to us' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '     ' ) ).not.toBe( '' );
		expect( validateBrazilianTIN( '🤡' ) ).not.toBe( '' );
		expect( () => validateBrazilianTIN( true ) ).toThrow( TypeError );
		expect( () => validateBrazilianTIN( 1337 ) ).toThrow( TypeError );
	} );
} );
