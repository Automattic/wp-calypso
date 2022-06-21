import { countries } from '../data';
import { makeTemplate, DIGIT_PLACEHOLDER } from '../phone-number';

describe( 'makeTemplate( pattern )', () => {
	test.each( [
		{ input: '4259999999', expected: '(...) ...-....' },
		{ input: '4259999', expected: '...-....' },
	] )( 'US Template is made when input is $input', function ( { input, expected } ) {
		const template = makeTemplate( input, countries.US.patterns );
		expect( template ).toEqual( expected.replace( /\./g, DIGIT_PLACEHOLDER ) );
	} );
} );
