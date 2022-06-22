import { findCountryFromNumber } from '../phone-number';

describe( 'Phone Number: findCountyFromNumber', () => {
	test.each( [
		{ code: '+90', expected: 'TR' },
		{ code: '0090', expected: 'TR' },
	] )( 'Returns an explicit dial code from $code', function ( { code, expected } ) {
		const result = findCountryFromNumber( code ).isoCode;
		expect( result ).toEqual( expected );
	} );

	test.each( [
		{ number: '+1604', expected: 'CA' },
		{ number: '+1425', expected: 'US' },
		{ number: '+14', expected: 'US' },
	] )( 'Returns a shared dial code with area code from $number', function ( { number, expected } ) {
		const result = findCountryFromNumber( number ).isoCode;
		expect( result ).toEqual( expected );
	} );

	test.each( [
		{ code: '+1', expected: 'US' },
		{ code: '+14', expected: 'US' },
		{ code: '+142', expected: 'US' },
		{ code: '+1425', expected: 'US' },
		{ code: '+16', expected: 'US' },
		{ code: '+160', expected: 'US' },
		{ code: '+1604', expected: 'CA' },
	] )( 'Returns a country code as soon as possible from $code', function ( { code, expected } ) {
		const result = findCountryFromNumber( code ).isoCode;
		expect( result ).toEqual( expected );
	} );

	test.each( [
		{ number: '+14255222222', expected: 'US' },
		{ number: '+16043412222', expected: 'CA' },
		{ number: '+905333239999', expected: 'TR' },
		{ number: '+493033239999', expected: 'DE' },
		{ number: '+61215369851', expected: 'AU' },
		{ number: '+81775991010', expected: 'JP' },
	] )( `Returns a country as soon as possible from $number`, function ( { number, expected } ) {
		const result = findCountryFromNumber( number ).isoCode;
		expect( result ).toEqual( expected );
	} );
} );
