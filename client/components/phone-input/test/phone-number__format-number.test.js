import { countries } from '../data';
import { formatNumber } from '../phone-number';

describe( 'International Format', () => {
	test.each( [
		{ number: '+14252222222', country: 'US', expected: '+1 425-222-2222' },
		{ number: '+905325555555', country: 'TR', expected: '+90 532 555 55 55' },
		{ number: '+5555912345678', country: 'BR', expected: '+55 55 91234-5678' },
		{ number: '+393911711711', country: 'IT', expected: '+39 391 171 1711' },
		{ number: '+919100123456', country: 'IN', expected: '+91 91001 23456' },
		{ number: '+18096865700', country: 'DO', expected: '+1 809-686-5700' },
	] )( `Format full length numbers for $country`, function ( { number, country, expected } ) {
		const result = formatNumber( number, countries[ country ] );
		expect( result ).toEqual( expected );
	} );

	test.each( [
		{ number: '+1', country: 'US', expected: '+1' },
		{ number: '+14', country: 'US', expected: '+14' },
		{ number: '+142', country: 'US', expected: '+1 42' },
		{ number: '+1425', country: 'US', expected: '+1 425' },
		{ number: '+14256', country: 'US', expected: '+1 425-6' },
		{ number: '+142565', country: 'US', expected: '+1 425-65' },
		{ number: '+1425655', country: 'US', expected: '+1 425-655' },
		{ number: '+14256559', country: 'US', expected: '+1 425-655-9' },
		{ number: '+142565599', country: 'US', expected: '+1 425-655-99' },
		{ number: '+1425655999', country: 'US', expected: '+1 425-655-999' },
		{ number: '+14256559999', country: 'US', expected: '+1 425-655-9999' },
		{ number: '+1', country: 'CA', expected: '+1' },
		{ number: '+16', country: 'CA', expected: '+16' },
		{ number: '+160', country: 'CA', expected: '+1 60' },
		{ number: '+1604', country: 'CA', expected: '+1 604' },
		{ number: '+16046', country: 'CA', expected: '+1 604-6' },
		{ number: '+160465', country: 'CA', expected: '+1 604-65' },
		{ number: '+1604655', country: 'CA', expected: '+1 604-655' },
		{ number: '+16046559', country: 'CA', expected: '+1 604-655-9' },
		{ number: '+160465599', country: 'CA', expected: '+1 604-655-99' },
		{ number: '+1604655999', country: 'CA', expected: '+1 604-655-999' },
		{ number: '+16046559999', country: 'CA', expected: '+1 604-655-9999' },
		{ number: '+90', country: 'TR', expected: '+90' },
		{ number: '+905', country: 'TR', expected: '+90 5' },
		{ number: '+9055', country: 'TR', expected: '+90 55' },
		{ number: '+90555', country: 'TR', expected: '+90 555' },
		{ number: '+905558', country: 'TR', expected: '+90 555 8' },
		{ number: '+9055588', country: 'TR', expected: '+90 555 88' },
		{ number: '+90555888', country: 'TR', expected: '+90 555 888' },
		{ number: '+905558889', country: 'TR', expected: '+90 555 888 9' },
		{ number: '+9055588899', country: 'TR', expected: '+90 555 888 99' },
		{ number: '+90555888999', country: 'TR', expected: '+90 555 888 99 9' },
		{ number: '+905558889999', country: 'TR', expected: '+90 555 888 99 99' },
	] )( `Number is formatted as it is typed ($number)`, function ( { number, country, expected } ) {
		const result = formatNumber( number, countries[ country ] );
		expect( result ).toEqual( expected );
	} );
} );

describe( 'National Format', () => {
	test.each( [
		{ number: '4252222222', country: 'US', expected: '(425) 222-2222' },
		{ number: '05325555555', country: 'TR', expected: '0532 555 55 55' },
		{ number: '0215369851', country: 'AU', expected: '02 1536 9851' },
		{ number: '3911711711', country: 'IT', expected: '391 171 1711' },
		{ number: '5512345678', country: 'BR', expected: '055 1234-5678' },
		{ number: '9100123456', country: 'IN', expected: '091001 23456' },
		{ number: '00000123456', country: 'UK', expected: '01234 56' },
	] )(
		`Format full length numbers ($number) for country $country`,
		function ( { number, country, expected } ) {
			const result = formatNumber( number, countries[ country ] );
			expect( result ).toEqual( expected );
		}
	);

	test.each( [
		{ number: '4,', country: 'US', expected: '4' },
		{ number: '42,', country: 'US', expected: '42' },
		{ number: '425,', country: 'US', expected: '425' },
		{ number: '4256,', country: 'US', expected: '425-6' },
		{ number: '42565,', country: 'US', expected: '425-65' },
		{ number: '425655,', country: 'US', expected: '425-655' },
		{ number: '4256559,', country: 'US', expected: '425-6559' },
		{ number: '42565599,', country: 'US', expected: '(425) 655-99' },
		{ number: '425655999,', country: 'US', expected: '(425) 655-999' },
		{ number: '4256559999,', country: 'US', expected: '(425) 655-9999' },
		{ number: '6,', country: 'US', expected: '6' },
		{ number: '60,', country: 'US', expected: '60' },
		{ number: '604,', country: 'US', expected: '604' },
		{ number: '6046,', country: 'US', expected: '604-6' },
		{ number: '60465,', country: 'US', expected: '604-65' },
		{ number: '604655,', country: 'US', expected: '604-655' },
		{ number: '6046559,', country: 'US', expected: '604-6559' },
		{ number: '60465599,', country: 'US', expected: '(604) 655-99' },
		{ number: '604655999,', country: 'US', expected: '(604) 655-999' },
		{ number: '6046559999,', country: 'US', expected: '(604) 655-9999' },
		{ number: '5', country: 'FR', expected: '5' },
		{ number: '54', country: 'FR', expected: '54' },
		{ number: '543', country: 'FR', expected: '05 43' },
		{ number: '5432', country: 'FR', expected: '05 43 2' },
		{ number: '54321', country: 'FR', expected: '05 43 21' },
		{ number: '543212', country: 'FR', expected: '05 43 21 2' },
		{ number: '5432123', country: 'FR', expected: '05 43 21 23' },
		{ number: '54321234', country: 'FR', expected: '05 43 21 23 4' },
		{ number: '543212345', country: 'FR', expected: '05 43 21 23 45' },
		{ number: '2', country: 'MX', expected: '2' },
		{ number: '24', country: 'MX', expected: '24' },
		{ number: '243', country: 'MX', expected: '01243' },
		{ number: '2432', country: 'MX', expected: '01243 2' },
		{ number: '24321', country: 'MX', expected: '01243 21' },
		{ number: '243212', country: 'MX', expected: '01243 212' },
		{ number: '2432123', country: 'MX', expected: '01243 212 3' },
		{ number: '24321234', country: 'MX', expected: '01243 212 34' },
		{ number: '243212345', country: 'MX', expected: '01243 212 345' },
		{ number: '2432123456', country: 'MX', expected: '01243 212 3456' },
	] )(
		`Number is formatted as as it is typed ($number)`,
		function ( { number, country, expected } ) {
			const result = formatNumber( number, countries[ country ] );
			expect( result ).toEqual( expected );
		}
	);

	test.each( [
		{ number: '6', country: 'US', expected: '6' },
		{ number: '60', country: 'US', expected: '60' },
		{ number: '604', country: 'US', expected: '604' },
		{ number: '604-6', country: 'US', expected: '604-6' },
		{ number: '604-65', country: 'US', expected: '604-65' },
		{ number: '604-655', country: 'US', expected: '604-655' },
		{ number: '604-6559', country: 'US', expected: '604-6559' },
		{ number: '604-65599', country: 'US', expected: '(604) 655-99' },
		{ number: '604-655-999', country: 'US', expected: '(604) 655-999' },
		{ number: '604-655-9999', country: 'US', expected: '(604) 655-9999' },

		{ number: '5', country: 'FR', expected: '5' },
		{ number: '54', country: 'FR', expected: '54' },
		{ number: '543', country: 'FR', expected: '05 43' },
		{ number: '05 432', country: 'FR', expected: '05 43 2' },
		{ number: '05 43 21', country: 'FR', expected: '05 43 21' },
		{ number: '05 43 212', country: 'FR', expected: '05 43 21 2' },
		{ number: '05 43 21 23', country: 'FR', expected: '05 43 21 23' },
		{ number: '05 43 21 234', country: 'FR', expected: '05 43 21 23 4' },
		{ number: '05 43 21 23 45', country: 'FR', expected: '05 43 21 23 45' },

		{ number: '2', country: 'MX', expected: '2' },
		{ number: '24', country: 'MX', expected: '24' },
		{ number: '01243', country: 'MX', expected: '01243' },
		{ number: '012432', country: 'MX', expected: '01243 2' },
		{ number: '01243 21', country: 'MX', expected: '01243 21' },
		{ number: '01243 212', country: 'MX', expected: '01243 212' },
		{ number: '01243 2123', country: 'MX', expected: '01243 212 3' },
		{ number: '01243 212 34', country: 'MX', expected: '01243 212 34' },
		{ number: '01243 212 345', country: 'MX', expected: '01243 212 345' },
		{ number: '01243 212 3456', country: 'MX', expected: '01243 212 3456' },

		{ number: '2', country: 'HU', expected: '2' },
		{ number: '24', country: 'HU', expected: '24' },
		{ number: '06243', country: 'HU', expected: '0624 3' },
		{ number: '0624 32', country: 'HU', expected: '0624 32' },
		{ number: '0624 321', country: 'HU', expected: '0624 321' },
		{ number: '0624 3212', country: 'HU', expected: '0624 321 2' },
		{ number: '0624 321 23', country: 'HU', expected: '0624 321 23' },
		{ number: '0624 321 234', country: 'HU', expected: '0624 321 234' },
		{ number: '0624 321 2345', country: 'HU', expected: '0624 321 2345' },

		{ number: '2', country: 'RU', expected: '2' },
		{ number: '24', country: 'RU', expected: '24' },
		{ number: '8243', country: 'RU', expected: '8243' },
		{ number: '82432', country: 'RU', expected: '8243-2' },
		{ number: '8243-21', country: 'RU', expected: '8243-21' },
		{ number: '8243-212', country: 'RU', expected: '8243-21-2' },
		{ number: '8243-21-23', country: 'RU', expected: '8243-21-23' },
	] )(
		`Number is formatted as it is typed with formatting included in the input ($number)`,
		function ( { number, country, expected } ) {
			const result = formatNumber( number, countries[ country ] );
			expect( result ).toEqual( expected );
		}
	);

	test.each( [
		{ number: '9876543210', country: 'IS', expected: '9876543210' },
		{ number: '+96', country: 'IQ', expected: '+96' },
		{ number: '+126', country: 'AG', expected: '+126' },
	] )( `Prefix is not added for $country`, function ( { number, country, expected } ) {
		const result = formatNumber( number, countries[ country ] );
		expect( result ).toEqual( expected );
	} );
} );

describe( 'NANPA', () => {
	test( 'Formats full length number', function () {
		const result = formatNumber( '14252222222', countries.US );
		expect( result ).toEqual( '1 425-222-2222' );
	} );

	test.each( [
		{ number: '14', country: 'US', expected: '14' },
		{ number: '142', country: 'US', expected: '1 42' },
		{ number: '1425', country: 'US', expected: '1 425' },
		{ number: '14256', country: 'US', expected: '1 425-6' },
		{ number: '142565', country: 'US', expected: '1 425-65' },
		{ number: '1425655', country: 'US', expected: '1 425-655' },
		{ number: '14256559', country: 'US', expected: '1 425-655-9' },
		{ number: '142565599', country: 'US', expected: '1 425-655-99' },
		{ number: '1425655999', country: 'US', expected: '1 425-655-999' },
		{ number: '14256559999', country: 'US', expected: '1 425-655-9999' },
	] )( `Number is formatted as it is typed ($number)`, function ( { number, country, expected } ) {
		const result = formatNumber( number, countries[ country ] );
		expect( result ).toEqual( expected );
	} );
} );

describe( 'Sanitization', () => {
	test.each( [
		{ number: '1aaaa', country: 'US', expected: '1' },
		{ number: '1a', country: 'US', expected: '1' },
	] )(
		'Strip non-digits on string ($number) of length less than 3',
		function ( { number, country, expected } ) {
			const result = formatNumber( number, countries[ country ] );
			expect( result ).toEqual( expected );
		}
	);
} );
