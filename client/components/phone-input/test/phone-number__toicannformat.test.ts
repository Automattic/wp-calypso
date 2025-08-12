// @ts-nocheck - TODO: Fix TypeScript issues
import { countries } from '../data';
import { toIcannFormat } from '../phone-number';

describe( 'toIcannFormat', function () {
	test.each( [
		{ number: '14256559999', country: 'US', expected: '+1.4256559999' },
		{ number: '4256559999', country: 'US', expected: '+1.4256559999' },
	] )( 'Handles NANPA numbers ($number)', function ( { number, country, expected } ) {
		const result = toIcannFormat( number, countries[ country ] );
		expect( result ).toEqual( expected );
	} );

	test.each( [
		{ number: '05325556677', country: 'TR', expected: '+90.5325556677' },
		{ number: '01234567890', country: 'GB', expected: '+44.1234567890' },
		{ number: '012345678', country: 'IT', expected: '+39.012345678' },
	] )( 'Handles European numbers ($country)', function ( { number, country, expected } ) {
		const result = toIcannFormat( number, countries[ country ] );
		expect( result ).toEqual( expected );
	} );

	test( 'Separates country code for countries with national area code', function () {
		const expected = '+1.8686559999';
		const result = toIcannFormat( '+18686559999', countries.TT );
		expect( result ).toEqual( expected );
	} );

	test( 'Does not separate country code for non-overlapping country', function () {
		const expected = '+55.5512345678';
		const result = toIcannFormat( '+555512345678', countries.BR );
		expect( result ).toEqual( expected );
	} );
} );
