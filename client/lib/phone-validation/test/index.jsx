import phoneValidation from '..';

describe( 'Phone Validation Library', () => {
	test.each( [
		{ input: '', expected: 'phone_number_empty' },
		{ input: '+1234567', expected: 'phone_number_too_short' },
		{ input: '+123456789a', expected: 'phone_number_contains_letters' },
		{ input: '+(12345)6789', expected: 'phone_number_contains_special_characters' },
		{ input: '+111111111', expected: 'phone_number_invalid' },
	] )( 'Input $input shows error message $expected', function ( { input, expected } ) {
		expect( phoneValidation( input ).error ).toStrictEqual( expected );
	} );

	test.each( [
		{ input: '+447941952721', expected: 'phone_number_valid' }, // Valid United Kingdom number
		{ input: '+14631234567', expected: 'phone_number_valid' }, // Valid United States number
		{ input: '+542231234567', expected: 'phone_number_valid' }, // Valid Argentina without leading 9
		{ input: '+5492231234567', expected: 'phone_number_valid' }, // Valid Argentina with leading 9
		{ input: '+38598123456', expected: 'phone_number_valid' }, // Valid Croatian number
		{ input: '+4528123456', expected: 'phone_number_valid' }, // Valid Danish number
		{ input: '+18761234567', expected: 'phone_number_valid' }, // Valid Jamaican number
		{ input: '+84761234567', expected: 'phone_number_valid' }, // Valid Vietnamese (new) with leading 7
		{ input: '+84361234567', expected: 'phone_number_valid' }, // Valid Vietnamese (new) with leading 3
		{ input: '+840361234567', expected: 'phone_number_valid' }, // Valid Vietnamese (new) with leading 0
		{ input: '+299239349', expected: 'phone_number_valid' }, // Valid Greenland with leading 2
		{ input: '+97466641333', expected: 'phone_number_valid' }, // Valid Qatar with leading 2
		{ input: '+9595512345', expected: 'phone_number_valid' }, // Valid Myanmar with 7 digits
		{ input: '+95942612345', expected: 'phone_number_valid' }, // Valid Myanmar with 8 digits
		{ input: '+959426123456', expected: 'phone_number_valid' }, // Valid Myanmar with 9 digits
		{ input: '+5511961231234', expected: 'phone_number_valid' }, // Valid Brazil with 9 digits
	] )( 'Input $input validates as valid number', function ( { input, expected } ) {
		expect( phoneValidation( input ).info ).toStrictEqual( expected );
	} );
} );
