// @ts-nocheck - TODO: Fix TypeScript issues
import { countries } from '../data';
import { toE164 } from '../phone-number';

describe( 'toE164', () => {
	test.each( [
		{ number: '14256559999', country: 'US', expected: '+14256559999' },
		{ number: '4256559999', country: 'US', expected: '+14256559999' },
	] )( 'Handles NANPA numbers ($number)', function ( { number, country, expected } ) {
		const result = toE164( number, countries[ country ] );
		expect( result ).toEqual( expected );
	} );

	test.each( [
		{ number: '05325556677', country: 'TR', expected: '+905325556677' },
		{ number: '01234567890', country: 'GB', expected: '+441234567890' },
		{ number: '012345678', country: 'IT', expected: '+39012345678' },
	] )( 'Handles European numbers ($country)', function ( { number, country, expected } ) {
		const result = toE164( number, countries[ country ] );
		expect( result ).toEqual( expected );
	} );
} );
