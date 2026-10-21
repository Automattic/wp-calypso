import { isValidCPF, isValidCNPJ, isValidBrazilianTaxId } from '../src';

// Brazilian taxpayer IDs with valid check digits. CPF is the individual
// (11-digit) form; CNPJ is the company (14-digit) form. Both formatted and
// digits-only spellings should validate.
const VALID_CPF = '188.247.019-22';
const VALID_CPF_DIGITS = '18824701922';
const VALID_CNPJ = '67.762.675/0001-49';
const VALID_CNPJ_DIGITS = '67762675000149';

describe( 'isValidCPF', () => {
	it( 'accepts a valid CPF', () => {
		expect( isValidCPF( VALID_CPF ) ).toBe( true );
		expect( isValidCPF( VALID_CPF_DIGITS ) ).toBe( true );
	} );

	it( 'rejects a CPF with bad check digits', () => {
		expect( isValidCPF( '188.247.019-23' ) ).toBe( false );
	} );

	it( 'rejects a CNPJ', () => {
		expect( isValidCPF( VALID_CNPJ ) ).toBe( false );
	} );

	it( 'rejects empty and malformed input', () => {
		expect( isValidCPF( '' ) ).toBe( false );
		expect( isValidCPF( '123' ) ).toBe( false );
	} );
} );

describe( 'isValidCNPJ', () => {
	it( 'accepts a valid CNPJ', () => {
		expect( isValidCNPJ( VALID_CNPJ ) ).toBe( true );
		expect( isValidCNPJ( VALID_CNPJ_DIGITS ) ).toBe( true );
	} );

	it( 'rejects a CNPJ with bad check digits', () => {
		expect( isValidCNPJ( '67.762.675/0001-48' ) ).toBe( false );
	} );

	it( 'rejects a CPF', () => {
		expect( isValidCNPJ( VALID_CPF ) ).toBe( false );
	} );

	it( 'rejects empty and malformed input', () => {
		expect( isValidCNPJ( '' ) ).toBe( false );
		expect( isValidCNPJ( '123' ) ).toBe( false );
	} );
} );

describe( 'isValidBrazilianTaxId', () => {
	it( 'accepts a valid CPF (individual taxpayer)', () => {
		expect( isValidBrazilianTaxId( VALID_CPF ) ).toBe( true );
		expect( isValidBrazilianTaxId( VALID_CPF_DIGITS ) ).toBe( true );
	} );

	it( 'accepts a valid CNPJ (company taxpayer)', () => {
		expect( isValidBrazilianTaxId( VALID_CNPJ ) ).toBe( true );
		expect( isValidBrazilianTaxId( VALID_CNPJ_DIGITS ) ).toBe( true );
	} );

	it( 'rejects a value that is neither a valid CPF nor CNPJ', () => {
		expect( isValidBrazilianTaxId( '188.247.019-23' ) ).toBe( false );
		expect( isValidBrazilianTaxId( '67.762.675/0001-48' ) ).toBe( false );
	} );

	it( 'rejects empty and malformed input', () => {
		expect( isValidBrazilianTaxId( '' ) ).toBe( false );
		expect( isValidBrazilianTaxId( '123' ) ).toBe( false );
	} );
} );
