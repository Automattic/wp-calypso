import number_format from '../src/number-format';

/**
 * @see https://github.com/locutusjs/locutus/blob/f72d69859e67a6c8ae8f7cc19b0be45b789e0e66/test/languages/php/strings/test-number_format.js
 */
describe( 'number_format', () => {
	it( 'should pass example 1', () => {
		const expected = '1,235';
		const result = number_format( 1234.56 );
		expect( result ).toEqual( expected );
	} );

	it( 'should pass example 2', () => {
		const expected = '1 234,56';
		const result = number_format( 1234.56, 2, ',', ' ' );
		expect( result ).toEqual( expected );
	} );
	it( 'should pass example 3', () => {
		const expected = '1234.57';
		const result = number_format( 1234.5678, 2, '.', '' );
		expect( result ).toEqual( expected );
	} );
	it( 'should pass example 4', () => {
		const expected = '67,00';
		const result = number_format( 67, 2, ',', '.' );
		expect( result ).toEqual( expected );
	} );
	it( 'should pass example 5', () => {
		const expected = '1,000';
		const result = number_format( 1000 );
		expect( result ).toEqual( expected );
	} );
	it( 'should pass example 6', () => {
		const expected = '67.31';
		const result = number_format( 67.311, 2 );
		expect( result ).toEqual( expected );
	} );
	it( 'should pass example 7', () => {
		const expected = '1,000.6';
		const result = number_format( 1000.55, 1 );
		expect( result ).toEqual( expected );
	} );
	it( 'should pass example 8', () => {
		const expected = '67.000,00000';
		const result = number_format( 67000, 5, ',', '.' );
		expect( result ).toEqual( expected );
	} );
	it( 'should pass example 9', () => {
		const expected = '1';
		const result = number_format( 0.9, 0 );
		expect( result ).toEqual( expected );
	} );
	it( 'should pass example 10', () => {
		const expected = '1.20';
		const result = number_format( '1.20', 2 );
		expect( result ).toEqual( expected );
	} );
	it( 'should pass example 11', () => {
		const expected = '1.2000';
		const result = number_format( '1.20', 4 );
		expect( result ).toEqual( expected );
	} );
	it( 'should pass example 12', () => {
		const expected = '1.200';
		const result = number_format( '1.2000', 3 );
		expect( result ).toEqual( expected );
	} );
	it( 'should pass example 13', () => {
		const expected = '100 050.00';
		const result = number_format( '1 000,50', 2, '.', ' ' );
		expect( result ).toEqual( expected );
	} );
	it( 'should pass example 14', () => {
		const expected = '0.00000001';
		const result = number_format( 1e-8, 8, '.', '' );
		expect( result ).toEqual( expected );
	} );
} );
