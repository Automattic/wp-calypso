import phoneValidation from '..';

describe( 'Phone Validation Library', () => {
	test.each( [
		{ input: '', expected: 'phone_number_empty' },
		{ input: '+1234567', expected: 'phone_number_too_short' },
		{ input: '+123456789a', expected: 'phone_number_contains_letters' },
		{ input: '+(12345)6789', expected: 'phone_number_contains_special_characters' },
		{ input: '+111111111', expected: 'phone_number_invalid' },
	] )(
		'Invalid phone number ($input) results in error banner ($expected)',
		function ( { input, expected } ) {
			expect( phoneValidation( input ).error ).toStrictEqual( expected );
		}
	);

	test.each( [
		{ country: 'UK', input: '+447941952721' }, // Valid United Kingdom number
		{ country: 'US', input: '+14631234567' }, // Valid United States number
		{ country: 'AR', input: '+542231234567' }, // Valid Argentina without leading 9
		{ country: 'AR', input: '+5492231234567' }, // Valid Argentina with leading 9
		{ country: 'HR', input: '+38598123456' }, // Valid Croatian number
		{ country: 'DK', input: '+4528123456' }, // Valid Danish number
		{ country: 'JM', input: '+18761234567' }, // Valid Jamaican number
		{ country: 'VN', input: '+84761234567' }, // Valid Vietnamese (new) with leading 7
		{ country: 'VN', input: '+84361234567' }, // Valid Vietnamese (new) with leading 3
		{ country: 'VN', input: '+840361234567' }, // Valid Vietnamese (new) with leading 0
		{ country: 'GL', input: '+299239349' }, // Valid Greenland with leading 2
		{ country: 'QA', input: '+97466641333' }, // Valid Qatar with leading 2
		{ country: 'MM', input: '+9595512345' }, // Valid Myanmar with 7 digits
		{ country: 'MM', input: '+95942612345' }, // Valid Myanmar with 8 digits
		{ country: 'MM', input: '+959426123456' }, // Valid Myanmar with 9 digits
		{ country: 'BR', input: '+5511961231234' }, // Valid Brazil with 9 digits
	] )( 'International phone number ($country: $input) is validated', function ( { input } ) {
		expect( phoneValidation( input ).info ).toStrictEqual( 'phone_number_valid' );
	} );
} );
